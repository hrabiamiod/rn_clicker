import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { moderateListing, moderateImages } from "./openai";
import { upload, getFileUrl, deleteFile } from "./upload";
import { insertListingSchema, insertListingImageSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Rate limiting
const createListingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 listing creations per windowMs
  message: "Too many listings created from this IP, please try again later.",
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
      },
    },
  }));

  // Rate limiting
  app.use('/api', generalLimiter);

  // Auth middleware
  await setupAuth(app);

  // Static file serving for uploads
  app.use('/api/uploads', (req, res, next) => {
    res.header('Cache-Control', 'public, max-age=86400'); // 1 day cache
    next();
  });
  app.use('/api/uploads', express.static('uploads/listings'));

  // Initialize default categories
  await initializeCategories();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // 2FA routes
  app.post('/api/auth/2fa/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }

      const secret = speakeasy.generateSecret({
        name: `OgłoSzybko (${user.email})`,
        issuer: 'OgłoSzybko',
      });

      // Store the secret temporarily (in production, use a secure temporary store)
      await storage.updateUser(userId, { twoFactorSecret: secret.base32 });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({ qrCode, secret: secret.base32 });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  app.post('/api/auth/2fa/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA setup not found" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (verified) {
        await storage.updateUser(userId, { twoFactorEnabled: true });
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Invalid token" });
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Listings routes
  app.get('/api/listings', async (req, res) => {
    try {
      const {
        categoryId,
        location,
        minPrice,
        maxPrice,
        search,
        sortBy,
        limit = 20,
        offset = 0,
      } = req.query;

      const listings = await storage.getListings({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        location: location as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string,
        sortBy: sortBy as any,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        isApproved: true,
      });

      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListing(id);

      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Record view
      await storage.incrementViewCount(id);
      await storage.recordView({
        listingId: id,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referer'),
      });

      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.get('/api/my-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getListingsByUser(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch your listings" });
    }
  });

  app.post('/api/listings', isAuthenticated, createListingLimiter, upload.array('images', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];

      // Validate listing data
      const listingData = insertListingSchema.parse({
        ...req.body,
        userId,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        categoryId: parseInt(req.body.categoryId),
      });

      // AI moderation
      const moderationResult = await moderateListing(
        listingData.title,
        listingData.description,
        req.body.categoryName || '',
        listingData.price
      );

      // Image moderation if files uploaded
      let imageModerationResult = { approved: true, confidence: 1, reasons: [], category: 'appropriate' };
      if (files && files.length > 0) {
        // Convert first image to base64 for moderation
        const firstImage = files[0];
        const base64Image = firstImage.buffer?.toString('base64') || '';
        if (base64Image) {
          imageModerationResult = await moderateImages([base64Image]);
        }
      }

      // Determine if listing should be auto-approved
      const shouldAutoApprove = 
        moderationResult.approved && 
        imageModerationResult.approved && 
        moderationResult.confidence > 0.8 && 
        imageModerationResult.confidence > 0.8;

      // Create listing
      const listing = await storage.createListing({
        ...listingData,
        isApproved: shouldAutoApprove,
        moderationStatus: shouldAutoApprove ? 'approved' : 'pending',
        moderationNotes: shouldAutoApprove ? 'Auto-approved by AI' : 
          `AI Moderation - Text: ${moderationResult.reasons.join(', ')} | Images: ${imageModerationResult.reasons.join(', ')}`,
        publishedAt: shouldAutoApprove ? new Date() : null,
      });

      // Add images
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          await storage.addListingImage({
            listingId: listing.id,
            imageUrl: getFileUrl(file.filename),
            altText: `${listingData.title} - Image ${i + 1}`,
            sortOrder: i,
          });
        }
      }

      res.json({
        listing,
        moderation: {
          approved: shouldAutoApprove,
          textModeration: moderationResult,
          imageModeration: imageModerationResult,
        },
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingId = parseInt(req.params.id);
      
      const updates = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        // Reset moderation status when listing is updated
        isApproved: false,
        moderationStatus: 'pending',
      };

      const updatedListing = await storage.updateListing(listingId, userId, updates);
      
      if (!updatedListing) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingId = parseInt(req.params.id);
      
      const deleted = await storage.deleteListing(listingId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Favorites routes
  app.post('/api/favorites/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingId = parseInt(req.params.listingId);

      const result = await storage.toggleFavorite(userId, listingId);
      res.json({ favorited: result !== null });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Analytics routes
  app.get('/api/listings/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 30;
      const userId = req.user.claims.sub;

      // Verify user owns the listing
      const listing = await storage.getListing(listingId);
      if (!listing || listing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      const analytics = await storage.getListingAnalytics(listingId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeCategories() {
  try {
    const categories = await storage.getCategories();
    
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Motoryzacja', slug: 'motors', icon: 'fas fa-car', description: 'Samochody, motocykle, części samochodowe', sortOrder: 1 },
        { name: 'Nieruchomości', slug: 'real-estate', icon: 'fas fa-home', description: 'Mieszkania, domy, działki, wynajem', sortOrder: 2 },
        { name: 'Elektronika', slug: 'electronics', icon: 'fas fa-laptop', description: 'Komputery, telefony, sprzęt elektroniczny', sortOrder: 3 },
        { name: 'Moda', slug: 'fashion', icon: 'fas fa-tshirt', description: 'Odzież, obuwie, akcesoria', sortOrder: 4 },
        { name: 'Dom i Ogród', slug: 'home-garden', icon: 'fas fa-couch', description: 'Meble, wyposażenie domu, narzędzia ogrodnicze', sortOrder: 5 },
        { name: 'Praca', slug: 'jobs', icon: 'fas fa-briefcase', description: 'Oferty pracy, zlecenia', sortOrder: 6 },
        { name: 'Usługi', slug: 'services', icon: 'fas fa-tools', description: 'Usługi profesjonalne, naprawy', sortOrder: 7 },
        { name: 'Sport i Hobby', slug: 'sports-hobby', icon: 'fas fa-football-ball', description: 'Sprzęt sportowy, hobby, gry', sortOrder: 8 },
        { name: 'Kolekcje', slug: 'collectibles', icon: 'fas fa-gem', description: 'Antyki, sztuka, kolekcje', sortOrder: 9 },
        { name: 'Zwierzęta', slug: 'pets', icon: 'fas fa-paw', description: 'Zwierzęta, akcesoria dla zwierząt', sortOrder: 10 },
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }

      console.log('Default categories initialized');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

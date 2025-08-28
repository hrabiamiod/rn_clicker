import {
  users,
  categories,
  listings,
  listingImages,
  userFavorites,
  listingAnalytics,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Listing,
  type InsertListing,
  type ListingImage,
  type InsertListingImage,
  type UserFavorite,
  type InsertUserFavorite,
  type InsertListingAnalytics,
  type ListingWithDetails,
  type CategoryWithCount,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<CategoryWithCount[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Listing operations
  getListings(filters: {
    categoryId?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
    userId?: string;
    isApproved?: boolean;
  }): Promise<ListingWithDetails[]>;
  getListing(id: number): Promise<ListingWithDetails | undefined>;
  getListingsByUser(userId: string): Promise<ListingWithDetails[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, userId: string, updates: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: number, userId: string): Promise<boolean>;
  incrementViewCount(id: number): Promise<void>;
  approveListing(id: number): Promise<Listing | undefined>;

  // Image operations
  addListingImage(image: InsertListingImage): Promise<ListingImage>;
  deleteListingImage(id: number, listingId: number): Promise<boolean>;

  // Favorites operations
  toggleFavorite(userId: string, listingId: number): Promise<UserFavorite | null>;
  getUserFavorites(userId: string): Promise<ListingWithDetails[]>;

  // Analytics operations
  recordView(data: InsertListingAnalytics): Promise<void>;
  getListingAnalytics(listingId: number, days: number): Promise<{
    date: string;
    views: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<CategoryWithCount[]> {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        description: categories.description,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        listingCount: sql<number>`cast(count(${listings.id}) as int)`,
      })
      .from(categories)
      .leftJoin(
        listings,
        and(
          eq(listings.categoryId, categories.id),
          eq(listings.isActive, true),
          eq(listings.isApproved, true)
        )
      )
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(categories.sortOrder);

    return result;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Listing operations
  async getListings(filters: {
    categoryId?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
    userId?: string;
    isApproved?: boolean;
  }): Promise<ListingWithDetails[]> {
    let query = db
      .select({
        id: listings.id,
        userId: listings.userId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        location: listings.location,
        contactPhone: listings.contactPhone,
        contactEmail: listings.contactEmail,
        isActive: listings.isActive,
        isApproved: listings.isApproved,
        isFeatured: listings.isFeatured,
        moderationStatus: listings.moderationStatus,
        moderationNotes: listings.moderationNotes,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        publishedAt: listings.publishedAt,
        category: categories,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(listings)
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(users, eq(listings.userId, users.id));

    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(listings.userId, filters.userId));
    } else {
      conditions.push(eq(listings.isActive, true));
      if (filters.isApproved !== false) {
        conditions.push(eq(listings.isApproved, true));
      }
    }

    if (filters.categoryId) {
      conditions.push(eq(listings.categoryId, filters.categoryId));
    }

    if (filters.location) {
      conditions.push(like(listings.location, `%${filters.location}%`));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(listings.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${listings.price} <= ${filters.maxPrice}`);
    }

    if (filters.search) {
      conditions.push(
        or(
          like(listings.title, `%${filters.search}%`),
          like(listings.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        query = query.orderBy(asc(listings.createdAt));
        break;
      case 'price_asc':
        query = query.orderBy(asc(listings.price));
        break;
      case 'price_desc':
        query = query.orderBy(desc(listings.price));
        break;
      default: // newest
        query = query.orderBy(desc(listings.createdAt));
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;

    // Fetch images for each listing
    const listingsWithImages = await Promise.all(
      results.map(async (listing) => {
        const images = await db
          .select()
          .from(listingImages)
          .where(eq(listingImages.listingId, listing.id!))
          .orderBy(listingImages.sortOrder);

        return {
          ...listing,
          images,
        };
      })
    );

    return listingsWithImages as ListingWithDetails[];
  }

  async getListing(id: number): Promise<ListingWithDetails | undefined> {
    const [listing] = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        location: listings.location,
        contactPhone: listings.contactPhone,
        contactEmail: listings.contactEmail,
        isActive: listings.isActive,
        isApproved: listings.isApproved,
        isFeatured: listings.isFeatured,
        moderationStatus: listings.moderationStatus,
        moderationNotes: listings.moderationNotes,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        publishedAt: listings.publishedAt,
        category: categories,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(listings)
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(users, eq(listings.userId, users.id))
      .where(eq(listings.id, id));

    if (!listing) return undefined;

    const images = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, id))
      .orderBy(listingImages.sortOrder);

    return {
      ...listing,
      images,
    } as ListingWithDetails;
  }

  async getListingsByUser(userId: string): Promise<ListingWithDetails[]> {
    return this.getListings({ userId, isApproved: false });
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db
      .insert(listings)
      .values(listing)
      .returning();
    return newListing;
  }

  async updateListing(id: number, userId: string, updates: Partial<Listing>): Promise<Listing | undefined> {
    const [updatedListing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(listings.id, id), eq(listings.userId, userId)))
      .returning();
    return updatedListing;
  }

  async deleteListing(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(listings)
      .where(and(eq(listings.id, id), eq(listings.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.id, id));
  }

  async approveListing(id: number): Promise<Listing | undefined> {
    const [approvedListing] = await db
      .update(listings)
      .set({ 
        isApproved: true, 
        moderationStatus: 'approved',
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(listings.id, id))
      .returning();
    return approvedListing;
  }

  // Image operations
  async addListingImage(image: InsertListingImage): Promise<ListingImage> {
    const [newImage] = await db
      .insert(listingImages)
      .values(image)
      .returning();
    return newImage;
  }

  async deleteListingImage(id: number, listingId: number): Promise<boolean> {
    const result = await db
      .delete(listingImages)
      .where(and(eq(listingImages.id, id), eq(listingImages.listingId, listingId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Favorites operations
  async toggleFavorite(userId: string, listingId: number): Promise<UserFavorite | null> {
    const existing = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.listingId, listingId)));

    if (existing.length > 0) {
      await db
        .delete(userFavorites)
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.listingId, listingId)));
      return null;
    } else {
      const [favorite] = await db
        .insert(userFavorites)
        .values({ userId, listingId })
        .returning();
      return favorite;
    }
  }

  async getUserFavorites(userId: string): Promise<ListingWithDetails[]> {
    const favoriteListings = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        location: listings.location,
        contactPhone: listings.contactPhone,
        contactEmail: listings.contactEmail,
        isActive: listings.isActive,
        isApproved: listings.isApproved,
        isFeatured: listings.isFeatured,
        moderationStatus: listings.moderationStatus,
        moderationNotes: listings.moderationNotes,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        publishedAt: listings.publishedAt,
        category: categories,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(userFavorites)
      .leftJoin(listings, eq(userFavorites.listingId, listings.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(users, eq(listings.userId, users.id))
      .where(eq(userFavorites.userId, userId));

    // Fetch images for each listing
    const listingsWithImages = await Promise.all(
      favoriteListings.map(async (listing) => {
        const images = await db
          .select()
          .from(listingImages)
          .where(eq(listingImages.listingId, listing.id))
          .orderBy(listingImages.sortOrder);

        return {
          ...listing,
          images,
          isFavorited: true,
        };
      })
    );

    return listingsWithImages as ListingWithDetails[];
  }

  // Analytics operations
  async recordView(data: InsertListingAnalytics): Promise<void> {
    await db.insert(listingAnalytics).values(data);
  }

  async getListingAnalytics(listingId: number, days: number): Promise<{
    date: string;
    views: number;
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select({
        date: sql<string>`DATE(${listingAnalytics.viewDate})`,
        views: sql<number>`cast(count(*) as int)`,
      })
      .from(listingAnalytics)
      .where(
        and(
          eq(listingAnalytics.listingId, listingId),
          gte(listingAnalytics.viewDate, startDate)
        )
      )
      .groupBy(sql`DATE(${listingAnalytics.viewDate})`)
      .orderBy(sql`DATE(${listingAnalytics.viewDate})`);

    return result;
  }
}

export const storage = new DatabaseStorage();

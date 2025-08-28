# OgłoSzybko - Polish Classified Ads Platform

## Overview

OgłoSzybko is a modern, secure classified ads platform designed for the Polish market. The application features automatic content moderation using AI, beautiful animations, and a comprehensive user management system. It enables users to quickly publish classified ads with built-in security measures to prevent spam and inappropriate content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side is built with React 18 and TypeScript, utilizing a modern component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Animations**: Framer Motion for smooth micro-interactions and page transitions
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend follows a page-based structure with reusable components, implementing responsive design patterns and accessibility best practices.

### Backend Architecture

The server-side uses Node.js with Express in a RESTful API pattern:

- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js for HTTP server and middleware
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: Helmet for security headers, rate limiting, and CORS protection
- **File Upload**: Multer for handling image uploads with validation
- **API Design**: RESTful endpoints with consistent error handling and logging

### Database Design

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle for schema definition and query building
- **Database**: PostgreSQL for primary data storage
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Structured tables for users, categories, listings, images, favorites, and analytics
- **Relations**: Properly defined foreign key relationships between entities

Key database entities include:
- Users with authentication and profile information
- Categories with hierarchical organization
- Listings with approval status and moderation flags
- Images linked to listings with file metadata
- User favorites and listing analytics for engagement tracking

### Content Moderation System

AI-powered content moderation using OpenAI's GPT models:

- **Text Analysis**: Automatic review of listing titles and descriptions
- **Image Moderation**: Content analysis of uploaded images
- **Approval Workflow**: Automated approval/rejection with confidence scoring
- **Category Validation**: Ensures listings match their assigned categories
- **Spam Detection**: Identifies duplicate content and suspicious patterns

### File Storage and Management

Local file storage system with organized directory structure:

- **Upload Handling**: Multer-based file upload with size and type restrictions
- **Storage Organization**: Structured folder hierarchy for different content types
- **File Validation**: Image format validation and size limits
- **URL Generation**: Consistent file URL generation for frontend consumption

### Authentication and Authorization

Replit Auth integration with session-based authentication:

- **OAuth Integration**: OpenID Connect flow with Replit identity provider
- **Session Management**: Server-side session storage in PostgreSQL
- **User Management**: Automatic user profile creation and management
- **Route Protection**: Middleware-based route protection for authenticated endpoints

## External Dependencies

### Third-Party Services

- **Replit Auth**: OAuth 2.0/OpenID Connect authentication provider
- **OpenAI API**: GPT models for content moderation and analysis
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

### Development and Build Tools

- **Vite**: Frontend build tool and development server with HMR
- **TypeScript**: Type system for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling Dependencies

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Framer Motion**: Animation library for React
- **Lucide React**: Icon library with consistent design

### Development and Production Infrastructure

- **Docker**: Containerization for consistent deployment environments
- **Docker Compose**: Multi-container orchestration for local development
- **pgAdmin**: Database administration interface for development
- **Express Rate Limiting**: API rate limiting and abuse prevention
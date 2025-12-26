# Coffee Date Chronicles - Project Structure

This project follows a **vertical slice architecture** pattern, organizing code by feature rather than technical layer.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group for authenticated routes
│   │   ├── create/               # Create coffee date page
│   │   └── edit/[id]/            # Edit coffee date page
│   ├── api/                      # API routes
│   │   ├── coffee-dates/         # Coffee date CRUD operations
│   │   ├── photos/               # Photo upload/management
│   │   ├── locations/            # Google Maps integration
│   │   └── auth/                 # Authentication endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (memory cards display)
├── features/                     # Feature slices
│   ├── coffee-dates/             # Coffee date management slice
│   │   ├── components/           # UI components
│   │   ├── services/             # Business logic
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Feature-specific utilities
│   ├── photos/                   # Photo management slice
│   ├── locations/                # Google Maps integration slice
│   └── auth/                     # Authentication slice
├── shared/                       # Shared utilities and components
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Shared utilities
│   └── types/                    # Global types
└── components/                   # shadcn/ui components
    └── ui/                       # Generated shadcn/ui components
```

## Key Principles

1. **Feature-First Organization**: Related functionality is grouped together in feature slices
2. **Clear Separation of Concerns**: Components, services, types, and utilities are separated
3. **Shared Resources**: Common utilities and types are in the shared directory
4. **Type Safety**: Comprehensive TypeScript types for all data structures
5. **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your actual values:

- AWS credentials and configuration
- Google Maps API key
- Authentication secrets

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
# Design Document: Coffee Date Chronicles

## Overview

Coffee Date Chronicles is a personal web application built with Next.js 14 that serves as a digital scrapbook for documenting coffee dates between two people. The application follows a vertical slice architecture pattern, organizing code by feature rather than technical layer, ensuring maintainability and scalability.

The system provides a warm, intuitive interface for creating, viewing, and managing coffee date memories through elegant visual cards. Each memory captures multiple photos, ratings, location data via Google Maps integration, and metadata about the café experience.

## Architecture

### High-Level Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   React UI      │  │  Google Maps    │  │   shadcn/ui  │ │
│  │   Components    │  │   Components    │  │  Components  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Next.js 14 App Router                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   API Routes    │  │  Server Actions │  │   Middleware │ │
│  │   (REST)        │  │  (Form Handling)│  │   (Auth)     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Business Logic │  │   Data Access   │                  │
│  │   Services      │  │     Layer       │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ AWS SDK
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS Services                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Amazon S3     │  │   DynamoDB      │  │ Google Maps  │ │
│  │ (Photo Storage) │  │ (Metadata)      │  │     API      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Vertical Slice Architecture

The codebase is organized by feature slices rather than technical layers:

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group for authenticated routes
│   │   ├── create/               # Create coffee date page
│   │   └── edit/[id]/            # Edit coffee date page
│   ├── api/                      # API routes
│   │   ├── coffee-dates/         # Coffee date CRUD operations
│   │   ├── photos/               # Photo upload/management
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

## Components and Interfaces

### Core Components

#### 1. Memory Card Component
```typescript
interface MemoryCardProps {
  coffeeDate: CoffeeDate;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
}

interface CoffeeDate {
  id: string;
  cafeInfo: CafeInfo;
  photos: Photo[];
  primaryPhotoId: string;
  ratings: Ratings;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Photo Gallery Component
```typescript
interface PhotoGalleryProps {
  photos: Photo[];
  primaryPhotoId: string;
  onPhotoSelect?: (photoId: string) => void;
  onPrimaryPhotoChange?: (photoId: string) => void;
  isEditable?: boolean;
}

interface Photo {
  id: string;
  s3Key: string;
  s3Url: string;
  thumbnailUrl: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}
```

#### 3. Location Picker Component
```typescript
interface LocationPickerProps {
  onLocationSelect: (location: CafeInfo) => void;
  initialLocation?: CafeInfo;
  placeholder?: string;
}

interface CafeInfo {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
}
```

#### 4. Rating Component
```typescript
interface RatingProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
}

interface Ratings {
  coffee: number;
  dessert?: number;
}
```

### Service Interfaces

#### 1. Coffee Date Service
```typescript
interface CoffeeDateService {
  getAll(): Promise<CoffeeDate[]>;
  getById(id: string): Promise<CoffeeDate | null>;
  create(data: CreateCoffeeDateRequest): Promise<CoffeeDate>;
  update(id: string, data: UpdateCoffeeDateRequest): Promise<CoffeeDate>;
  delete(id: string): Promise<void>;
}

interface CreateCoffeeDateRequest {
  cafeInfo: CafeInfo;
  photos: File[];
  primaryPhotoIndex: number;
  ratings: Ratings;
  visitDate: Date;
}
```

#### 2. Photo Service
```typescript
interface PhotoService {
  uploadMultiple(files: File[]): Promise<Photo[]>;
  delete(photoId: string): Promise<void>;
  generateThumbnail(s3Key: string): Promise<string>;
  getSignedUrl(s3Key: string): Promise<string>;
}
```

#### 3. Location Service
```typescript
interface LocationService {
  searchPlaces(query: string): Promise<PlaceSearchResult[]>;
  getPlaceDetails(placeId: string): Promise<CafeInfo>;
  geocodeAddress(address: string): Promise<CafeInfo>;
}
```

#### 4. Authentication Service
```typescript
interface AuthService {
  authenticate(password: string): Promise<AuthResult>;
  verifySession(): Promise<boolean>;
  logout(): Promise<void>;
}

interface AuthResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
}
```

## Data Models

### DynamoDB Schema

#### Coffee Dates Table
```typescript
interface CoffeeDateRecord {
  PK: string;                    // "COFFEE_DATE#${id}"
  SK: string;                    // "METADATA"
  GSI1PK: string;               // "COFFEE_DATES"
  GSI1SK: string;               // ISO date string for sorting
  id: string;
  cafeInfo: CafeInfo;
  photoIds: string[];
  primaryPhotoId: string;
  ratings: Ratings;
  visitDate: string;            // ISO date string
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
}
```

#### Photos Table
```typescript
interface PhotoRecord {
  PK: string;                    // "PHOTO#${id}"
  SK: string;                    // "METADATA"
  GSI1PK: string;               // "COFFEE_DATE#${coffeeDateId}"
  GSI1SK: string;               // "PHOTO#${id}"
  id: string;
  coffeeDateId: string;
  s3Key: string;
  s3Bucket: string;
  filename: string;
  contentType: string;
  size: number;
  thumbnailS3Key?: string;
  uploadedAt: string;           // ISO date string
}
```

### S3 Structure
```
coffee-date-chronicles-photos/
├── originals/
│   ├── 2024/01/15/
│   │   ├── uuid1-original.jpg
│   │   └── uuid2-original.jpg
│   └── 2024/01/16/
│       └── uuid3-original.jpg
└── thumbnails/
    ├── 2024/01/15/
    │   ├── uuid1-thumb.jpg
    │   └── uuid2-thumb.jpg
    └── 2024/01/16/
        └── uuid3-thumb.jpg
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property-Based Testing Overview

The Coffee Date Chronicles application will be validated through property-based testing to ensure correctness across all possible inputs and scenarios. Each property represents a universal truth about the system's behavior.

### Prework Analysis

Let me analyze each acceptance criterion for testability:

### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated to eliminate redundancy:

- **Rating validation properties (3.1, 3.2)** can be combined into a single comprehensive rating validation property
- **Photo storage and association properties (1.2, 5.2)** overlap and can be consolidated
- **Data persistence properties (1.5, 6.1)** can be combined into a comprehensive persistence property
- **Authentication properties (8.1, 8.2, 8.5)** can be streamlined into core authentication behavior properties

### Correctness Properties

Based on the prework analysis, here are the key correctness properties that will be implemented through property-based testing:

#### Property 1: Coffee Date Creation Completeness
*For any* valid coffee date with all required fields (photos, café name, date, ratings, location), creating the coffee date should result in all provided data being stored and retrievable.
**Validates: Requirements 1.1, 1.5**

#### Property 2: Photo Association Integrity
*For any* set of uploaded photos and coffee date, the photos should be properly associated with the coffee date and retrievable through the coffee date ID.
**Validates: Requirements 1.2, 5.2**

#### Property 3: Input Validation Consistency
*For any* café name input, empty strings and whitespace-only strings should be rejected, while valid non-empty names should be accepted.
**Validates: Requirements 1.3**

#### Property 4: Rating Boundary Validation
*For any* rating input for coffee or dessert, values between 1-5 (inclusive) should be accepted, and values outside this range should be rejected.
**Validates: Requirements 1.4, 3.1, 3.2**

#### Property 5: Memory Card Data Completeness
*For any* stored coffee date, the rendered memory card should contain all required fields: photos, café name, date, ratings, and location information.
**Validates: Requirements 2.2**

#### Property 6: Photo Navigation Availability
*For any* coffee date with multiple photos, navigation controls should be present and functional in the card interface.
**Validates: Requirements 2.5**

#### Property 7: Rating Display Consistency
*For any* coffee date with ratings, the ratings should be displayed in a visual format in the rendered card output.
**Validates: Requirements 3.3**

#### Property 8: Rating Update Persistence
*For any* coffee date with updated ratings, the new ratings should be saved and retrievable from storage.
**Validates: Requirements 3.4**

#### Property 9: Optional Dessert Rating Support
*For any* coffee date, it should be possible to create and store the coffee date without a dessert rating.
**Validates: Requirements 3.5**

#### Property 10: Location Search Integration
*For any* location search query, the system should return valid location results using Google Maps API.
**Validates: Requirements 4.1, 4.3**

#### Property 11: Location Data Completeness
*For any* selected location, all location details (coordinates, formatted address, place ID) should be captured and stored.
**Validates: Requirements 4.4**

#### Property 12: Image Format Validation
*For any* uploaded file, common image formats (JPEG, PNG, WebP) should be accepted, and non-image formats should be rejected.
**Validates: Requirements 5.1**

#### Property 13: Photo Upload Error Handling
*For any* failed photo upload, the system should provide error feedback and maintain system stability.
**Validates: Requirements 5.4**

#### Property 14: Image Resizing Consistency
*For any* large uploaded image, the system should resize it to appropriate web dimensions while maintaining aspect ratio.
**Validates: Requirements 5.5**

#### Property 15: Primary Photo Management
*For any* coffee date with multiple photos, users should be able to set and retrieve a primary photo for the memory card thumbnail.
**Validates: Requirements 5.6**

#### Property 16: Data Retrieval Completeness
*For any* stored coffee date, retrieving all coffee dates should include the stored coffee date with all its data intact.
**Validates: Requirements 6.3**

#### Property 17: Data Validation Before Persistence
*For any* invalid coffee date data, the system should reject the data before attempting to store it in the database.
**Validates: Requirements 6.5**

#### Property 18: Authentication Requirement for Write Operations
*For any* create, update, or delete operation, the system should require valid authentication before allowing the operation.
**Validates: Requirements 8.1**

#### Property 19: Authentication Success Behavior
*For any* valid password, the system should grant access to write operations for the authenticated session.
**Validates: Requirements 8.2**

#### Property 20: Public Read Access
*For any* coffee date viewing operation, the system should allow access without requiring authentication.
**Validates: Requirements 8.3**

#### Property 21: Authentication Failure Handling
*For any* invalid password attempt, the system should reject the authentication and provide appropriate feedback.
**Validates: Requirements 8.5**

#### Property 22: Session Expiration Management
*For any* expired authentication session, subsequent write operations should require re-authentication.
**Validates: Requirements 8.6**

## Error Handling

### Error Categories

#### 1. Validation Errors
- **Input Validation**: Empty café names, invalid ratings, unsupported file formats
- **Business Rule Violations**: Missing required fields, invalid date ranges
- **Response**: Return structured error messages with field-specific feedback

#### 2. External Service Errors
- **Google Maps API**: Rate limiting, invalid API keys, network timeouts
- **AWS Services**: S3 upload failures, DynamoDB connection issues
- **Response**: Implement retry logic with exponential backoff, fallback to cached data where possible

#### 3. Authentication Errors
- **Invalid Credentials**: Wrong password, expired sessions
- **Authorization Failures**: Attempting write operations without authentication
- **Response**: Clear error messages, redirect to authentication when needed

#### 4. System Errors
- **Database Errors**: Connection failures, query timeouts
- **File System Errors**: Disk space, permission issues
- **Response**: Log errors for monitoring, return generic user-friendly messages

### Error Handling Patterns

#### API Route Error Handling
```typescript
export async function POST(request: Request) {
  try {
    // Business logic
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Log unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Client-Side Error Handling
```typescript
// Using React Error Boundaries for component errors
// Using toast notifications for user feedback
// Implementing retry mechanisms for transient failures
```

## Testing Strategy

### Dual Testing Approach

The Coffee Date Chronicles application will implement both unit testing and property-based testing to ensure comprehensive coverage and correctness validation.

#### Unit Testing
Unit tests will focus on:
- **Specific Examples**: Testing concrete scenarios with known inputs and expected outputs
- **Edge Cases**: Boundary conditions, empty states, and error conditions
- **Integration Points**: API route handlers, database operations, external service integrations
- **Component Behavior**: React component rendering, user interactions, state management

**Unit Test Examples**:
- Test that empty state displays when no coffee dates exist
- Test that photo upload handles network failures gracefully
- Test that authentication middleware blocks unauthorized requests
- Test that memory cards render correctly with sample data

#### Property-Based Testing
Property tests will validate universal properties across all inputs using **fast-check** library for TypeScript/JavaScript:
- **Universal Properties**: Behaviors that must hold for all valid inputs
- **Comprehensive Input Coverage**: Randomized test data generation
- **Correctness Validation**: Formal verification of system properties
- **Minimum 100 iterations per property test** to ensure thorough coverage

**Property Test Configuration**:
Each property test will be tagged with a comment referencing its design document property:
```typescript
// Feature: coffee-date-management, Property 1: Coffee Date Creation Completeness
```

**Property Test Examples**:
- For any valid coffee date input, creation should store all provided data
- For any rating value 1-5, the system should accept it; for any value outside this range, reject it
- For any uploaded image in supported formats, the system should process it successfully
- For any authentication attempt with correct password, access should be granted

#### Testing Framework Setup
- **Unit Tests**: Jest with React Testing Library for component testing
- **Property Tests**: fast-check for property-based testing
- **Integration Tests**: Supertest for API endpoint testing
- **E2E Tests**: Playwright for full user journey testing

#### Test Organization
```
src/
├── features/
│   └── coffee-dates/
│       ├── __tests__/
│       │   ├── components/
│       │   │   ├── MemoryCard.test.tsx
│       │   │   └── PhotoGallery.test.tsx
│       │   ├── services/
│       │   │   ├── CoffeeDateService.test.ts
│       │   │   └── CoffeeDateService.properties.test.ts
│       │   └── utils/
│       └── components/
└── __tests__/
    ├── api/
    │   └── coffee-dates.test.ts
    └── integration/
        └── coffee-date-flow.test.ts
```

The combination of unit tests and property tests ensures both specific functionality works correctly and universal system properties hold across all possible inputs, providing comprehensive confidence in the application's correctness.
// Core domain types for Coffee Date Chronicles

export interface CoffeeDate {
  id: string;
  cafeInfo: CafeInfo;
  photos: Photo[];
  primaryPhotoId: string;
  ratings: Ratings;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CafeInfo {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
}

export interface Photo {
  id: string;
  s3Key: string;
  s3Url: string;
  thumbnailUrl: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}

export interface Ratings {
  coffee: number;
  dessert?: number;
}

export interface CreateCoffeeDateRequest {
  cafeInfo: CafeInfo;
  photos: File[];
  primaryPhotoIndex: number;
  ratings: Ratings;
  visitDate: Date;
}

export interface UpdateCoffeeDateRequest {
  cafeInfo?: CafeInfo;
  ratings?: Ratings;
  visitDate?: Date;
  primaryPhotoId?: string;
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
}

export interface AuthResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
}

// DynamoDB record types
export interface CoffeeDateRecord {
  PK: string; // "COFFEE_DATE#${id}"
  SK: string; // "METADATA"
  GSI1PK: string; // "COFFEE_DATES"
  GSI1SK: string; // ISO date string for sorting
  id: string;
  cafeInfo: CafeInfo;
  photoIds: string[];
  primaryPhotoId: string;
  ratings: Ratings;
  visitDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PhotoRecord {
  PK: string; // "PHOTO#${id}"
  SK: string; // "METADATA"
  GSI1PK: string; // "COFFEE_DATE#${coffeeDateId}"
  GSI1SK: string; // "PHOTO#${id}"
  id: string;
  coffeeDateId: string;
  s3Key: string;
  s3Bucket: string;
  filename: string;
  contentType: string;
  size: number;
  thumbnailS3Key?: string;
  uploadedAt: string; // ISO date string
}

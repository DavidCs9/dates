import type { Photo } from "@/shared/types";

export interface PhotoService {
  uploadMultiple(files: File[], coffeeDateId?: string): Promise<Photo[]>;
  delete(photoId: string): Promise<void>;
  generateThumbnail(s3Key: string): Promise<string>;
  getSignedUrl(s3Key: string): Promise<string>;
}

export interface PhotoGalleryProps {
  photos: Photo[];
  primaryPhotoId: string;
  onPhotoSelect?: (photoId: string) => void;
  onPrimaryPhotoChange?: (photoId: string) => void;
  isEditable?: boolean;
}

export * from "@/shared/types";

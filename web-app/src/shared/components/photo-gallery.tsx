import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Photo } from "@/shared/types";

export interface PhotoGalleryProps {
  photos: Photo[];
  primaryPhotoId: string;
  onPhotoSelect?: (photoId: string) => void;
  onPrimaryPhotoChange?: (photoId: string) => void;
  isEditable?: boolean;
  className?: string;
}

export function PhotoGallery({
  photos,
  primaryPhotoId,
  onPhotoSelect,
  onPrimaryPhotoChange,
  isEditable = false,
  className,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-48 bg-gray-100 rounded-lg",
          className,
        )}
      >
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const isPrimaryPhoto = currentPhoto.id === primaryPhotoId;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePhotoClick = () => {
    if (onPhotoSelect) {
      onPhotoSelect(currentPhoto.id);
    }
  };

  const handleSetPrimary = () => {
    if (onPrimaryPhotoChange && !isPrimaryPhoto) {
      onPrimaryPhotoChange(currentPhoto.id);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Main photo display */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={currentPhoto.s3Url}
          alt={currentPhoto.filename}
          fill
          className="object-cover cursor-pointer"
          onClick={handlePhotoClick}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Primary photo indicator */}
        {isPrimaryPhoto && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              Primary
            </div>
          </div>
        )}

        {/* Navigation arrows - only show if multiple photos */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        )}

        {/* Set as primary button - only show in edit mode */}
        {isEditable && !isPrimaryPhoto && (
          <div className="absolute bottom-2 right-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSetPrimary}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Star className="h-3 w-3 mr-1" />
              Set Primary
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnail strip - only show if multiple photos */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <Image
                src={photo.thumbnailUrl || photo.s3Url}
                alt={photo.filename}
                fill
                className="object-cover"
                sizes="64px"
              />
              {photo.id === primaryPhotoId && (
                <div className="absolute top-0 right-0 bg-yellow-500 rounded-bl">
                  <Star className="h-2 w-2 text-white fill-current m-0.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

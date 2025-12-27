import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
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
  /** Whether this is the first/primary card visible on the page (for priority loading) */
  isPriority?: boolean;
}

export function PhotoGallery({
  photos,
  primaryPhotoId,
  onPhotoSelect,
  onPrimaryPhotoChange,
  isEditable = false,
  className,
  isPriority = false,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance for navigation (in pixels)
  const minSwipeDistance = 50;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Early return after all hooks
  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-36 sm:h-48 bg-gray-100 rounded-lg",
          className,
        )}
      >
        <p className="text-gray-500 text-sm">No photos available</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const isPrimaryPhoto = currentPhoto.id === primaryPhotoId;

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

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && photos.length > 1) {
      handleNext();
    }
    if (isRightSwipe && photos.length > 1) {
      handlePrevious();
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Main photo display */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={currentPhoto.s3Url}
          alt={currentPhoto.filename}
          fill
          className="object-cover cursor-pointer select-none"
          onClick={handlePhotoClick}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          draggable={false}
          priority={isPriority && currentIndex === 0}
          loading={isPriority && currentIndex === 0 ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/ANF0bqC+1G8ure6t7WOOJgqmJmJYEA5OQPXNWaUqhZYzKCTJuf/Z"
        />

        {/* Primary photo indicator */}
        {isPrimaryPhoto && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-yellow-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
              <span className="hidden sm:inline">Primary</span>
            </div>
          </div>
        )}

        {/* Navigation arrows - visible on hover for desktop, always visible on mobile */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
              onClick={handlePrevious}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
              onClick={handleNext}
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/50 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
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
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs h-7 sm:h-8 touch-manipulation"
            >
              <Star className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Set Primary</span>
              <span className="sm:hidden">Primary</span>
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnail strip - only show if multiple photos */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 sm:pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-12 h-9 sm:w-16 sm:h-12 rounded overflow-hidden border-2 transition-all touch-manipulation",
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 active:border-gray-400",
              )}
              aria-label={`View photo ${index + 1}`}
            >
              <Image
                src={photo.thumbnailUrl || photo.s3Url}
                alt={photo.filename}
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
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

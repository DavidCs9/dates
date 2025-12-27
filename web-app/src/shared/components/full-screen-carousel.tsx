"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Photo } from "@/shared/types";

export interface FullScreenCarouselProps {
  photos: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenCarousel({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
}: FullScreenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance for navigation (in pixels)
  const minSwipeDistance = 50;

  // Reset index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex]);

  // Reset zoom when photo changes
  useEffect(() => {
    setIsZoomed(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, handlePrevious, handleNext, onClose],
  );

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

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none">
        <DialogTitle className="sr-only">
          Photo Carousel - {currentPhoto.filename}
        </DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70 h-10 w-10"
            onClick={onClose}
            aria-label="Close carousel"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Photo counter */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 z-50">
              <div className="bg-black/50 text-white px-3 py-2 rounded text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70 h-10 w-10"
              onClick={() => setIsZoomed(!isZoomed)}
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            >
              {isZoomed ? (
                <ZoomOut className="h-5 w-5" />
              ) : (
                <ZoomIn className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Main image container */}
          <button
            type="button"
            className={cn(
              "relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-in-out bg-transparent border-none p-0",
              isZoomed
                ? "scale-150 cursor-grab active:cursor-grabbing"
                : "cursor-pointer",
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={() => !isZoomed && setIsZoomed(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isZoomed) setIsZoomed(true);
              }
            }}
            aria-label={isZoomed ? "Image zoomed in" : "Click to zoom in"}
          >
            <div className="relative max-w-full max-h-full">
              <Image
                src={currentPhoto.s3Url}
                alt={currentPhoto.filename}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain select-none"
                sizes="100vw"
                priority
                draggable={false}
              />
            </div>
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-12 w-12 z-40"
                onClick={handlePrevious}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-12 w-12 z-40"
                onClick={handleNext}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Photo filename */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-black/50 text-white px-3 py-2 rounded text-sm max-w-xs truncate">
              {currentPhoto.filename}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CoffeeDate } from "@/shared/types";

interface DeleteConfirmationDialogProps {
  coffeeDate: CoffeeDate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coffeeDateId: string) => Promise<void>;
}

export function DeleteConfirmationDialog({
  coffeeDate,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!coffeeDate) return;

    setIsDeleting(true);
    try {
      await onConfirm(coffeeDate.id);
      onClose();
      toast.success("Coffee date deleted successfully");
    } catch (error) {
      console.error("Failed to delete coffee date:", error);
      toast.error("Failed to delete coffee date. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!coffeeDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Delete Coffee Date
          </DialogTitle>
          <DialogDescription className="text-left text-sm">
            Are you sure you want to delete this coffee date? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Coffee Date Preview */}
        <div className="py-3 sm:py-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            {coffeeDate.photos.length > 0 && (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                <Image
                  src={
                    coffeeDate.photos.find(
                      (p) => p.id === coffeeDate.primaryPhotoId,
                    )?.thumbnailUrl || coffeeDate.photos[0].thumbnailUrl
                  }
                  alt={coffeeDate.cafeInfo.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                {coffeeDate.cafeInfo.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {coffeeDate.cafeInfo.formattedAddress}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {coffeeDate.visitDate.toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {coffeeDate.photos.length} photo
                {coffeeDate.photos.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto touch-manipulation"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Coffee Date
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

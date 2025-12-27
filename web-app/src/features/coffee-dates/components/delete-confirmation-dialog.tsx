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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Coffee Date
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete this coffee date? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Coffee Date Preview */}
        <div className="py-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            {coffeeDate.photos.length > 0 && (
              <div className="relative w-16 h-16 flex-shrink-0">
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
              <h3 className="font-medium truncate">
                {coffeeDate.cafeInfo.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {coffeeDate.cafeInfo.formattedAddress}
              </p>
              <p className="text-sm text-muted-foreground">
                {coffeeDate.visitDate.toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {coffeeDate.photos.length} photo
                {coffeeDate.photos.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Coffee Date
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

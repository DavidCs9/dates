import { Calendar, Edit, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhotoGallery, Rating } from "@/shared/components";
import type { MemoryCardProps } from "../types";

export function MemoryCard({
  coffeeDate,
  onEdit,
  onDelete,
  isAuthenticated = false,
  isPriority = false,
}: MemoryCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(coffeeDate.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(coffeeDate.id);
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2">
          {coffeeDate.cafeInfo.name}
        </CardTitle>
        {isAuthenticated && (
          <CardAction>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleEdit}
                className="h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
                aria-label="Edit coffee date"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive touch-manipulation"
                aria-label="Delete coffee date"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
        {/* Photo Gallery */}
        {coffeeDate.photos.length > 0 && (
          <PhotoGallery
            photos={coffeeDate.photos}
            primaryPhotoId={coffeeDate.primaryPhotoId}
            className="w-full"
            isPriority={isPriority}
          />
        )}

        {/* Location Information */}
        <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2 break-words">
            {coffeeDate.cafeInfo.formattedAddress}
          </span>
        </div>

        {/* Visit Date */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span suppressHydrationWarning>
            {new Date(coffeeDate.visitDate).toLocaleDateString("es", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>

        {/* Ratings */}
        <div className="space-y-2 mt-auto pt-2">
          <Rating
            label="Café"
            value={coffeeDate.ratings.coffee}
            readonly
            className="text-xs sm:text-sm"
          />
          {coffeeDate.ratings.dessert && (
            <Rating
              label="Postre"
              value={coffeeDate.ratings.dessert}
              readonly
              className="text-xs sm:text-sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

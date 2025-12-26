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
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          {coffeeDate.cafeInfo.name}
        </CardTitle>
        {isAuthenticated && (
          <CardAction>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleEdit}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Photo Gallery */}
        {coffeeDate.photos.length > 0 && (
          <PhotoGallery
            photos={coffeeDate.photos}
            primaryPhotoId={coffeeDate.primaryPhotoId}
            className="w-full"
          />
        )}

        {/* Location Information */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {coffeeDate.cafeInfo.formattedAddress}
          </span>
        </div>

        {/* Visit Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(coffeeDate.visitDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Ratings */}
        <div className="space-y-2">
          <Rating
            label="Coffee"
            value={coffeeDate.ratings.coffee}
            readonly
            className="text-sm"
          />
          {coffeeDate.ratings.dessert && (
            <Rating
              label="Dessert"
              value={coffeeDate.ratings.dessert}
              readonly
              className="text-sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

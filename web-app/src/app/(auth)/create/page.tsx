"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CoffeeDateForm } from "@/features/coffee-dates/components";
import { coffeeDateClientService } from "@/features/coffee-dates/services";
import { photoClientService } from "@/features/photos/services/client";
import type { CreateCoffeeDateRequest } from "@/shared/types";

export default function CreateCoffeeDatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateCoffeeDateRequest) => {
    setIsLoading(true);

    try {
      // First, create the coffee date without photos
      const coffeeDate = await coffeeDateClientService.create({
        ...data,
        photos: [], // We'll handle photos separately
        primaryPhotoIndex: 0,
      });

      // Upload photos if any
      if (data.photos.length > 0) {
        const uploadedPhotos = await photoClientService.uploadMultiple(
          data.photos,
          coffeeDate.id,
        );

        // Update the coffee date with the primary photo ID
        if (uploadedPhotos.length > 0) {
          const primaryPhotoId =
            uploadedPhotos[data.primaryPhotoIndex]?.id || uploadedPhotos[0].id;
          await coffeeDateClientService.update(coffeeDate.id, {
            primaryPhotoId,
          });
        }
      }

      toast.success("Coffee date created successfully!");
      router.push("/");
    } catch (error) {
      console.error("Failed to create coffee date:", error);
      toast.error("Failed to create coffee date. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto py-4 sm:py-8 px-4 overflow-y-auto">
        <CoffeeDateForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Coffee Date"
        />
      </div>
    </div>
  );
}

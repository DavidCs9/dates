"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CoffeeDateEditForm } from "@/features/coffee-dates/components";
import { coffeeDateClientService } from "@/features/coffee-dates/services";
import { photoClientService } from "@/features/photos/services/client";
import { FormHeader, Loading } from "@/shared/components";
import type { CoffeeDate, CreateCoffeeDateRequest } from "@/shared/types";

interface EditCoffeeDatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCoffeeDatePage({
  params,
}: EditCoffeeDatePageProps) {
  const router = useRouter();
  const [coffeeDate, setCoffeeDate] = useState<CoffeeDate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null,
  );

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Load coffee date data
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const loadCoffeeDate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await coffeeDateClientService.getById(resolvedParams.id);
        if (!data) {
          setError("Coffee date not found");
          return;
        }

        setCoffeeDate(data);
      } catch (err) {
        console.error("Failed to load coffee date:", err);
        setError("Failed to load coffee date");
      } finally {
        setIsLoading(false);
      }
    };

    loadCoffeeDate();
  }, [resolvedParams?.id]);

  const handleCancel = () => {
    router.push("/");
  };

  const handleSubmit = async (
    data: CreateCoffeeDateRequest & { removedPhotoIds: string[] },
  ) => {
    if (!coffeeDate) return;

    setIsSaving(true);

    try {
      // Remove deleted photos first
      if (data.removedPhotoIds.length > 0) {
        await Promise.all(
          data.removedPhotoIds.map((photoId) =>
            photoClientService.delete(photoId),
          ),
        );
      }

      // Update basic coffee date information
      await coffeeDateClientService.update(coffeeDate.id, {
        cafeInfo: data.cafeInfo,
        ratings: data.ratings,
        visitDate: data.visitDate,
      });

      // Upload new photos if any
      if (data.photos.length > 0) {
        const uploadedPhotos = await photoClientService.uploadMultiple(
          data.photos,
          coffeeDate.id,
        );

        // If we uploaded new photos and no primary photo is set, use the first new photo
        if (uploadedPhotos.length > 0) {
          const remainingExistingPhotos = coffeeDate.photos.filter(
            (photo) => !data.removedPhotoIds.includes(photo.id),
          );

          // If no existing photos remain, set the first new photo as primary
          if (remainingExistingPhotos.length === 0) {
            await coffeeDateClientService.update(coffeeDate.id, {
              primaryPhotoId: uploadedPhotos[0].id,
            });
          }
        }
      }

      toast.success("Coffee date updated successfully!");
      router.push("/");
    } catch (error) {
      console.error("Failed to update coffee date:", error);
      toast.error("Failed to update coffee date. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <FormHeader title="Edit Coffee Date" onBack={handleCancel} />
        <div className="flex-1 container mx-auto py-4 sm:py-8 px-4 flex justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <FormHeader title="Edit Coffee Date" onBack={handleCancel} />
        <div className="flex-1 container mx-auto py-4 sm:py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-primary hover:underline"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coffeeDate) {
    return (
      <div className="min-h-screen flex flex-col">
        <FormHeader title="Edit Coffee Date" onBack={handleCancel} />
        <div className="flex-1 container mx-auto py-4 sm:py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Coffee Date Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The coffee date you're looking for doesn't exist.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-primary hover:underline"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FormHeader title="Edit Coffee Date" onBack={handleCancel} />
      <div className="flex-1 container mx-auto py-4 sm:py-8 px-4 overflow-y-auto">
        <CoffeeDateEditForm
          coffeeDate={coffeeDate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/features/locations/components/location-picker";
import { cn } from "@/lib/utils";
import { Rating } from "@/shared/components/rating";
import type {
  CafeInfo,
  CoffeeDate,
  CreateCoffeeDateRequest,
  Photo,
} from "@/shared/types";

// Form validation schema for editing
const editCoffeeDateFormSchema = z.object({
  cafeInfo: z.object({
    placeId: z.string().min(1, "Please select a café location"),
    name: z.string().min(1, "Café name is required"),
    formattedAddress: z.string().min(1, "Address is required"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    types: z.array(z.string()),
  }),
  visitDate: z.string().min(1, "Visit date is required"),
  ratings: z.object({
    coffee: z.number().min(1, "Coffee rating is required").max(5),
    dessert: z.number().min(1).max(5).optional(),
  }),
  newPhotos: z.array(z.instanceof(File)),
  primaryPhotoId: z.string().optional(),
});

type EditCoffeeDateFormData = z.infer<typeof editCoffeeDateFormSchema>;

interface CoffeeDateEditFormProps {
  coffeeDate: CoffeeDate;
  onSubmit: (
    data: CreateCoffeeDateRequest & { removedPhotoIds: string[] },
  ) => Promise<void>;
  isLoading?: boolean;
}

export function CoffeeDateEditForm({
  coffeeDate,
  onSubmit,
  isLoading = false,
}: CoffeeDateEditFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(
    coffeeDate.photos,
  );
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [newPhotoPreviewUrls, setNewPhotoPreviewUrls] = useState<string[]>([]);
  const [maxDate, setMaxDate] = useState<string>("");

  // Set max date on client side only to avoid hydration mismatch
  useEffect(() => {
    setMaxDate(new Date().toISOString().split("T")[0]);
  }, []);

  const form = useForm<EditCoffeeDateFormData>({
    resolver: zodResolver(editCoffeeDateFormSchema),
    defaultValues: {
      cafeInfo: coffeeDate.cafeInfo,
      visitDate: coffeeDate.visitDate.toISOString().split("T")[0],
      ratings: coffeeDate.ratings,
      newPhotos: [],
      primaryPhotoId: coffeeDate.primaryPhotoId,
    },
  });

  const watchedNewPhotos = form.watch("newPhotos");
  const watchedPrimaryPhotoId = form.watch("primaryPhotoId");

  // Update new photo preview URLs when new photos change
  const updateNewPhotoPreviewUrls = useCallback(
    (files: File[]) => {
      // Clean up existing URLs
      for (const url of newPhotoPreviewUrls) {
        URL.revokeObjectURL(url);
      }

      // Create new URLs
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setNewPhotoPreviewUrls(newUrls);
    },
    [newPhotoPreviewUrls],
  );

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of newPhotoPreviewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [newPhotoPreviewUrls]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          return false;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        const currentNewPhotos = form.getValues("newPhotos");
        const newPhotos = [...currentNewPhotos, ...validFiles];
        form.setValue("newPhotos", newPhotos);
        updateNewPhotoPreviewUrls(newPhotos);
      }
    },
    [form, updateNewPhotoPreviewUrls],
  );

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect],
  );

  // Remove existing photo
  const removeExistingPhoto = useCallback(
    async (photoId: string) => {
      try {
        // Add to removed list
        setRemovedPhotoIds((prev) => [...prev, photoId]);

        // Remove from existing photos
        setExistingPhotos((prev) =>
          prev.filter((photo) => photo.id !== photoId),
        );

        // If this was the primary photo, reset primary photo
        if (photoId === watchedPrimaryPhotoId) {
          const remainingPhotos = existingPhotos.filter(
            (photo) => photo.id !== photoId,
          );
          if (remainingPhotos.length > 0) {
            form.setValue("primaryPhotoId", remainingPhotos[0].id);
          } else {
            form.setValue("primaryPhotoId", "");
          }
        }

        toast.success("Photo will be removed when you save");
      } catch (error) {
        console.error("Error removing photo:", error);
        toast.error("Failed to remove photo");
      }
    },
    [watchedPrimaryPhotoId, existingPhotos, form],
  );

  // Remove new photo
  const removeNewPhoto = useCallback(
    (index: number) => {
      const currentNewPhotos = form.getValues("newPhotos");
      const newPhotos = currentNewPhotos.filter((_, i) => i !== index);
      form.setValue("newPhotos", newPhotos);
      updateNewPhotoPreviewUrls(newPhotos);
    },
    [form, updateNewPhotoPreviewUrls],
  );

  // Set primary photo
  const setPrimaryPhoto = useCallback(
    (photoId: string) => {
      form.setValue("primaryPhotoId", photoId);
    },
    [form],
  );

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: CafeInfo) => {
      form.setValue("cafeInfo", location);
      form.clearErrors("cafeInfo");
    },
    [form],
  );

  // Handle form submission
  const handleSubmit = async (data: EditCoffeeDateFormData) => {
    try {
      // Check if we have at least one photo remaining
      const totalPhotos = existingPhotos.length + data.newPhotos.length;
      if (totalPhotos === 0) {
        toast.error("At least one photo is required");
        return;
      }

      const submitData: CreateCoffeeDateRequest & {
        removedPhotoIds: string[];
      } = {
        cafeInfo: data.cafeInfo,
        photos: data.newPhotos,
        primaryPhotoIndex: 0, // This will be handled differently for edits
        ratings: data.ratings,
        visitDate: new Date(data.visitDate),
        removedPhotoIds,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to update coffee date. Please try again.");
    }
  };

  // Get all photos for display (existing + new)
  const allPhotos = [
    ...existingPhotos.map((photo) => ({
      type: "existing" as const,
      photo,
      id: photo.id,
    })),
    ...watchedNewPhotos.map((file, index) => ({
      type: "new" as const,
      file,
      id: `new-${index}`,
      previewUrl: newPhotoPreviewUrls[index],
    })),
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto min-h-0">
      <CardHeader className="px-4 sm:px-6 pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Edit Coffee Date</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Location Selection */}
            <FormField
              control={form.control}
              name="cafeInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Café Location</FormLabel>
                  <FormControl>
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={field.value}
                      placeholder="Search for a café..."
                    />
                  </FormControl>
                  <FormDescription>
                    Search and select the café where you had your coffee date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Date */}
            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        {...field}
                        className="pr-10"
                        max={maxDate}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    When did you visit this café?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ratings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="ratings.coffee"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Rating
                        label="Coffee Rating"
                        value={field.value}
                        onChange={field.onChange}
                        max={5}
                      />
                    </FormControl>
                    <FormDescription>
                      How would you rate the coffee? (1-5 stars)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.dessert"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Rating
                        label="Dessert Rating (Optional)"
                        value={field.value || 0}
                        onChange={(value) =>
                          field.onChange(value > 0 ? value : undefined)
                        }
                        max={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Did you have dessert? Rate it here (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Photo Management */}
            <div className="space-y-4">
              <FormLabel>Photos</FormLabel>

              {/* Existing and New Photos */}
              {allPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  {allPhotos.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative group rounded-lg overflow-hidden border-2",
                        item.id === watchedPrimaryPhotoId
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={
                            item.type === "existing"
                              ? item.photo.thumbnailUrl
                              : item.previewUrl
                          }
                          alt={`Preview ${item.id}`}
                          fill
                          className="object-cover"
                        />

                        {/* Primary Photo Badge */}
                        {item.id === watchedPrimaryPhotoId && (
                          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary text-primary-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            Primary
                          </div>
                        )}

                        {/* Action Buttons - Always visible on mobile, hover on desktop */}
                        <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2">
                          {item.id !== watchedPrimaryPhotoId && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryPhoto(item.id)}
                              className="h-7 sm:h-8 text-[10px] sm:text-xs touch-manipulation w-full max-w-[120px]"
                            >
                              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Set Primary
                              </span>
                              <span className="sm:hidden">Primary</span>
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (item.type === "existing") {
                                removeExistingPhoto(item.photo.id);
                              } else {
                                const index = parseInt(
                                  item.id.replace("new-", ""),
                                  10,
                                );
                                removeNewPhoto(index);
                              }
                            }}
                            className="h-7 sm:h-8 text-[10px] sm:text-xs touch-manipulation w-full max-w-[120px]"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="p-1.5 sm:p-2 bg-muted/50">
                        <p className="text-[10px] sm:text-xs truncate">
                          {item.type === "existing"
                            ? item.photo.filename
                            : item.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area for New Photos */}
              <button
                type="button"
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Add more photos</span> - drag
                    and drop or click
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 10MB each
                  </div>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </button>

              <FormDescription>
                You can add new photos, remove existing ones, and change which
                photo is primary.
              </FormDescription>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 sm:pt-6 pb-2 sm:pb-0">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-w-28 sm:min-w-32 touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Updating...</span>
                    <span className="sm:hidden">Update</span>
                  </>
                ) : (
                  "Update Coffee Date"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

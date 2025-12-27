"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
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
import type { CafeInfo, CreateCoffeeDateRequest } from "@/shared/types";

// Form validation schema
const coffeeDateFormSchema = z.object({
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
    dessert: z.number().min(0).max(5).optional(),
  }),
  photos: z.array(z.instanceof(File)).min(1, "At least one photo is required"),
  primaryPhotoIndex: z.number().min(0),
});

type CoffeeDateFormData = z.infer<typeof coffeeDateFormSchema>;

interface CoffeeDateFormProps {
  initialData?: Partial<CoffeeDateFormData>;
  onSubmit: (data: CreateCoffeeDateRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CoffeeDateForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Coffee Date",
}: CoffeeDateFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const form = useForm<CoffeeDateFormData>({
    resolver: zodResolver(coffeeDateFormSchema),
    defaultValues: {
      cafeInfo: initialData?.cafeInfo || {
        placeId: "",
        name: "",
        formattedAddress: "",
        coordinates: { lat: 0, lng: 0 },
        types: [],
      },
      visitDate:
        initialData?.visitDate || new Date().toISOString().split("T")[0],
      ratings: {
        coffee: initialData?.ratings?.coffee || 5,
        dessert: initialData?.ratings?.dessert,
      },
      photos: initialData?.photos || [],
      primaryPhotoIndex: initialData?.primaryPhotoIndex || 0,
    },
  });

  const watchedPhotos = form.watch("photos");
  const watchedPrimaryIndex = form.watch("primaryPhotoIndex");

  // Update photo preview URLs when photos change
  const updatePhotoPreviewUrls = useCallback(
    (files: File[]) => {
      // Clean up existing URLs
      for (const url of photoPreviewUrls) {
        URL.revokeObjectURL(url);
      }

      // Create new URLs
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviewUrls(newUrls);
    },
    [photoPreviewUrls],
  );

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
        const currentPhotos = form.getValues("photos");
        const newPhotos = [...currentPhotos, ...validFiles];
        form.setValue("photos", newPhotos);
        updatePhotoPreviewUrls(newPhotos);

        // Clear any existing error
        form.clearErrors("photos");
      }
    },
    [form, updatePhotoPreviewUrls],
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

  // Remove photo
  const removePhoto = useCallback(
    (index: number) => {
      const currentPhotos = form.getValues("photos");
      const currentPrimaryIndex = form.getValues("primaryPhotoIndex");

      // Remove the photo
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      form.setValue("photos", newPhotos);

      // Adjust primary photo index
      let newPrimaryIndex = currentPrimaryIndex;
      if (index === currentPrimaryIndex) {
        // If we removed the primary photo, set to first photo
        newPrimaryIndex = 0;
      } else if (index < currentPrimaryIndex) {
        // If we removed a photo before the primary, adjust index
        newPrimaryIndex = currentPrimaryIndex - 1;
      }

      form.setValue("primaryPhotoIndex", Math.max(0, newPrimaryIndex));
      updatePhotoPreviewUrls(newPhotos);

      // If no photos left, show error
      if (newPhotos.length === 0) {
        form.setError("photos", { message: "At least one photo is required" });
      }
    },
    [form, updatePhotoPreviewUrls],
  );

  // Set primary photo
  const setPrimaryPhoto = useCallback(
    (index: number) => {
      form.setValue("primaryPhotoIndex", index);
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
  const handleSubmit = async (data: CoffeeDateFormData) => {
    try {
      // Validate that we have a proper location selected
      if (!data.cafeInfo.placeId) {
        form.setError("cafeInfo", { message: "Please select a café location" });
        toast.error("Please select a café location before submitting");
        return;
      }

      // Validate that we have photos
      if (data.photos.length === 0) {
        form.setError("photos", { message: "At least one photo is required" });
        toast.error("Please add at least one photo before submitting");
        return;
      }

      const submitData: CreateCoffeeDateRequest = {
        cafeInfo: data.cafeInfo,
        photos: data.photos,
        primaryPhotoIndex: data.primaryPhotoIndex,
        ratings: data.ratings,
        visitDate: new Date(data.visitDate),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save coffee date. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto min-h-0">
      <CardHeader className="px-4 sm:px-6 pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          Create New Coffee Date
        </CardTitle>
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
                      initialLocation={
                        field.value.placeId ? field.value : undefined
                      }
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
                        max={new Date().toISOString().split("T")[0]}
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

            {/* Photo Upload */}
            <FormField
              control={form.control}
              name="photos"
              render={() => (
                <FormItem>
                  <FormLabel>Photos</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Upload Area */}
                      <button
                        type="button"
                        className={cn(
                          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full",
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                          form.formState.errors.photos && "border-destructive",
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div className="text-sm">
                            <span className="font-medium">Click to upload</span>{" "}
                            or drag and drop
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

                      {/* Photo Previews */}
                      {watchedPhotos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {watchedPhotos.map((photo, index) => (
                            <div
                              key={`${photo.name}-${index}`}
                              className={cn(
                                "relative group rounded-lg overflow-hidden border-2",
                                index === watchedPrimaryIndex
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-border",
                              )}
                            >
                              <div className="aspect-square relative">
                                <Image
                                  src={photoPreviewUrls[index]}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />

                                {/* Primary Photo Badge */}
                                {index === watchedPrimaryIndex && (
                                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary text-primary-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                    Primary
                                  </div>
                                )}

                                {/* Action Buttons - Always visible on mobile, hover on desktop */}
                                <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2">
                                  {index !== watchedPrimaryIndex && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => setPrimaryPhoto(index)}
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
                                    onClick={() => removePhoto(index)}
                                    className="h-7 sm:h-8 text-[10px] sm:text-xs touch-manipulation w-full max-w-[120px]"
                                  >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              <div className="p-1.5 sm:p-2 bg-muted/50">
                                <p
                                  className="text-[10px] sm:text-xs truncate"
                                  title={photo.name}
                                >
                                  {photo.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload photos from your coffee date. The first photo will be
                    the primary photo for the memory card.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>

            {/* Debug info for development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <details>
                  <summary className="cursor-pointer font-medium">
                    Debug Form State
                  </summary>
                  <div className="mt-2 space-y-1">
                    <div>
                      Form Valid: {form.formState.isValid ? "✅" : "❌"}
                    </div>
                    <div>
                      Location Selected:{" "}
                      {form.watch("cafeInfo.placeId") ? "✅" : "❌"}
                    </div>
                    <div>Photos Count: {form.watch("photos").length}</div>
                    <div>Coffee Rating: {form.watch("ratings.coffee")}</div>
                    {Object.keys(form.formState.errors).length > 0 && (
                      <div>
                        <div className="font-medium text-destructive">
                          Errors:
                        </div>
                        <pre className="text-destructive">
                          {JSON.stringify(form.formState.errors, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

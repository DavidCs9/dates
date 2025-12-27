"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { photoClientService } from "@/features/photos/services/client";
import { coffeeDateClientService } from "../services";

export function useCoffeeDateManagement() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (coffeeDateId: string) => {
    router.push(`/edit/${coffeeDateId}`);
  };

  const handleDelete = async (coffeeDateId: string) => {
    setIsDeleting(true);

    try {
      // Get the coffee date to access its photos
      const coffeeDate = await coffeeDateClientService.getById(coffeeDateId);

      if (!coffeeDate) {
        throw new Error("Coffee date not found");
      }

      // Delete all associated photos from S3 first
      if (coffeeDate.photos.length > 0) {
        await Promise.all(
          coffeeDate.photos.map((photo) => photoClientService.delete(photo.id)),
        );
      }

      // Delete the coffee date (this will also clean up DynamoDB photo records)
      await coffeeDateClientService.delete(coffeeDateId);

      toast.success("Coffee date deleted successfully");

      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete coffee date:", error);
      toast.error("Failed to delete coffee date. Please try again.");
      throw error; // Re-throw so the dialog can handle the error state
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleEdit,
    handleDelete,
    isDeleting,
  };
}

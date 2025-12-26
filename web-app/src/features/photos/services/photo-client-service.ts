import type { Photo } from "@/shared/types";

/**
 * Client-side photo service that calls API routes
 */
export class PhotoClientService {
  /**
   * Upload multiple photos via API route
   */
  async uploadMultiple(files: File[], coffeeDateId?: string): Promise<Photo[]> {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      if (coffeeDateId) {
        formData.append("coffeeDateId", coffeeDateId);
      }

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload photos");
      }

      const data = await response.json();
      return data.photos;
    } catch (error) {
      console.error("Failed to upload photos:", error);
      throw error;
    }
  }

  /**
   * Delete a photo via API route
   */
  async delete(photoId: string): Promise<void> {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const photoClientService = new PhotoClientService();

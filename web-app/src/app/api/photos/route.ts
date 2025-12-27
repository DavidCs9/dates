import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/features/auth/utils/auth-middleware";
import { photoService } from "@/features/photos/services/server";
import {
  AuthenticationError,
  getErrorMessage,
  ValidationError,
} from "@/shared/lib/errors";

/**
 * POST /api/photos - Upload photos
 * Protected endpoint (authentication required)
 */
export const POST = withAuth(
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const formData = await request.formData();
      const files = formData.getAll("files") as File[];
      const coffeeDateId = formData.get("coffeeDateId") as string;

      // Validate files
      if (!files || files.length === 0) {
        return NextResponse.json(
          {
            error: "At least one file is required",
            field: "files",
          },
          { status: 400 },
        );
      }

      // Validate file types and sizes
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!(file instanceof File)) {
          return NextResponse.json(
            {
              error: `Invalid file at index ${i}`,
              field: `files[${i}]`,
            },
            { status: 400 },
          );
        }

        if (file.size > maxFileSize) {
          return NextResponse.json(
            {
              error: `File "${file.name}" exceeds maximum size of 10MB`,
              field: `files[${i}].size`,
            },
            { status: 400 },
          );
        }

        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            {
              error: `File "${file.name}" has unsupported type. Allowed types: ${allowedTypes.join(", ")}`,
              field: `files[${i}].type`,
            },
            { status: 400 },
          );
        }
      }

      const uploadedPhotos = await photoService.uploadMultiple(
        files,
        coffeeDateId || undefined,
      );

      return NextResponse.json({ photos: uploadedPhotos }, { status: 201 });
    } catch (error) {
      console.error("Photo upload error:", error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: error.message,
            field: error.field,
          },
          { status: 400 },
        );
      }

      if (error instanceof AuthenticationError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Failed to upload photos" },
        { status: 500 },
      );
    }
  },
);

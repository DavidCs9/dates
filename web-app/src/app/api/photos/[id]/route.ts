import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/features/auth/utils/auth-middleware";
import { photoService } from "@/features/photos/services/server";
import { ItemNotFoundError } from "@/shared/lib";
import { AuthenticationError, ValidationError } from "@/shared/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/photos/[id] - Delete a photo
 * Protected endpoint (authentication required)
 */
export const DELETE = withAuth(
  async (
    _request: NextRequest,
    { params }: RouteParams,
  ): Promise<NextResponse> => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          {
            error: "Photo ID is required",
            field: "id",
          },
          { status: 400 },
        );
      }

      // Validate ID format (basic UUID validation)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return NextResponse.json(
          {
            error: "Invalid photo ID format",
            field: "id",
          },
          { status: 400 },
        );
      }

      await photoService.delete(id);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error(`Photo deletion error for ID ${(await params).id}:`, error);

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

      if (error instanceof ItemNotFoundError) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 },
      );
    }
  },
);

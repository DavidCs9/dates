import { type NextRequest, NextResponse } from "next/server";
import { photoService } from "@/features/photos/services/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 },
      );
    }

    await photoService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Photo deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 },
    );
  }
}

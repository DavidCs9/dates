import { type NextRequest, NextResponse } from "next/server";
import { photoService } from "@/features/photos/services/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const coffeeDateId = formData.get("coffeeDateId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedPhotos = await photoService.uploadMultiple(
      files,
      coffeeDateId,
    );

    return NextResponse.json({ photos: uploadedPhotos });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 },
    );
  }
}

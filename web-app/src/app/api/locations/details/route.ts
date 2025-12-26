import { type NextRequest, NextResponse } from "next/server";
import { getLocationService } from "@/features/locations/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: 'Query parameter "placeId" is required' },
        { status: 400 },
      );
    }

    if (placeId.trim().length === 0) {
      return NextResponse.json(
        { error: "Place ID cannot be empty" },
        { status: 400 },
      );
    }

    const locationService = getLocationService();
    const placeDetails = await locationService.getPlaceDetails(placeId);

    return NextResponse.json({ place: placeDetails });
  } catch (error) {
    console.error("Place details error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Google Maps API configuration error" },
          { status: 500 },
        );
      }

      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 },
        );
      }

      if (error.message.includes("NOT_FOUND")) {
        return NextResponse.json({ error: "Place not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to get place details" },
      { status: 500 },
    );
  }
}

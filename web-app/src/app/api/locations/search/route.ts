import { type NextRequest, NextResponse } from "next/server";
import { getLocationService } from "@/features/locations/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 },
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters long" },
        { status: 400 },
      );
    }

    const locationService = getLocationService();
    const results = await locationService.searchPlaces(query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Location search error:", error);

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
    }

    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 },
    );
  }
}

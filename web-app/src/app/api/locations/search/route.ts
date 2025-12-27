import { type NextRequest, NextResponse } from "next/server";
import { getLocationService } from "@/features/locations/services";
import { ExternalServiceError, ValidationError } from "@/shared/lib/errors";

/**
 * GET /api/locations/search - Search for places using Google Maps API
 * Public endpoint (no authentication required)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        {
          error: 'Query parameter "q" is required',
          field: "q",
        },
        { status: 400 },
      );
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return NextResponse.json(
        {
          error: "Query must be at least 2 characters long",
          field: "q",
        },
        { status: 400 },
      );
    }

    if (trimmedQuery.length > 200) {
      return NextResponse.json(
        {
          error: "Query must be less than 200 characters",
          field: "q",
        },
        { status: 400 },
      );
    }

    const locationService = getLocationService();
    const results = await locationService.searchPlaces(trimmedQuery);

    return NextResponse.json({
      results,
      query: trimmedQuery,
      count: results.length,
    });
  } catch (error) {
    console.error("Location search error:", error);

    const { searchParams } = new URL(request.url);
    const originalQuery = searchParams.get("q") || "";

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          field: error.field,
        },
        { status: 400 },
      );
    }

    if (error instanceof ExternalServiceError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    if (error instanceof Error) {
      // Handle specific Google Maps API errors
      if (
        error.message.includes("API key") ||
        error.message.includes("not configured")
      ) {
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

      if (error.message.includes("ZERO_RESULTS")) {
        return NextResponse.json({
          results: [],
          query: originalQuery,
          count: 0,
        });
      }

      if (error.message.includes("INVALID_REQUEST")) {
        return NextResponse.json(
          {
            error: "Invalid search request",
            field: "q",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 },
    );
  }
}

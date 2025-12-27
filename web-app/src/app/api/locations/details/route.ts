import { type NextRequest, NextResponse } from "next/server";
import { ServerLocationService } from "@/features/locations/services/server-location-service";
import {
  ExternalServiceError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";

/**
 * GET /api/locations/details - Get place details using Google Maps API
 * Public endpoint (no authentication required)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    // Validate placeId parameter
    if (!placeId) {
      return NextResponse.json(
        {
          error: 'Query parameter "placeId" is required',
          field: "placeId",
        },
        { status: 400 },
      );
    }

    const trimmedPlaceId = placeId.trim();
    if (trimmedPlaceId.length === 0) {
      return NextResponse.json(
        {
          error: "Place ID cannot be empty",
          field: "placeId",
        },
        { status: 400 },
      );
    }

    // Basic validation for Google Place ID format
    // Google Place IDs typically start with certain prefixes and have specific patterns
    if (trimmedPlaceId.length < 10 || trimmedPlaceId.length > 200) {
      return NextResponse.json(
        {
          error: "Invalid Place ID format",
          field: "placeId",
        },
        { status: 400 },
      );
    }

    const locationService = new ServerLocationService();
    const placeDetails = await locationService.getPlaceDetails(trimmedPlaceId);

    return NextResponse.json({
      place: placeDetails,
      placeId: trimmedPlaceId,
    });
  } catch (error) {
    console.error("Place details error:", error);

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

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
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

      if (
        error.message.includes("NOT_FOUND") ||
        error.message.includes("INVALID_REQUEST")
      ) {
        return NextResponse.json({ error: "Place not found" }, { status: 404 });
      }

      if (error.message.includes("ZERO_RESULTS")) {
        return NextResponse.json(
          { error: "No details available for this place" },
          { status: 404 },
        );
      }

      if (error.message.includes("Incomplete place details")) {
        return NextResponse.json(
          { error: "Incomplete place information received from Google Maps" },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to get place details" },
      { status: 500 },
    );
  }
}

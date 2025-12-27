import { type NextRequest, NextResponse } from "next/server";
import { getLocationService } from "@/features/locations/services";
import {
  ExternalServiceError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";

/**
 * GET /api/locations/geocode - Geocode an address using Google Maps API
 * Public endpoint (no authentication required)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        {
          error: 'Query parameter "address" is required',
          field: "address",
        },
        { status: 400 },
      );
    }

    const trimmedAddress = address.trim();
    if (trimmedAddress.length === 0) {
      return NextResponse.json(
        {
          error: "Address cannot be empty",
          field: "address",
        },
        { status: 400 },
      );
    }

    if (trimmedAddress.length < 3) {
      return NextResponse.json(
        {
          error: "Address must be at least 3 characters long",
          field: "address",
        },
        { status: 400 },
      );
    }

    if (trimmedAddress.length > 500) {
      return NextResponse.json(
        {
          error: "Address must be less than 500 characters",
          field: "address",
        },
        { status: 400 },
      );
    }

    const locationService = getLocationService();
    const geocodedLocation =
      await locationService.geocodeAddress(trimmedAddress);

    return NextResponse.json({
      location: geocodedLocation,
      originalAddress: trimmedAddress,
    });
  } catch (error) {
    console.error("Geocoding error:", error);

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
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
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
        return NextResponse.json(
          { error: "No location found for the provided address" },
          { status: 404 },
        );
      }

      if (error.message.includes("INVALID_REQUEST")) {
        return NextResponse.json(
          {
            error: "Invalid address format",
            field: "address",
          },
          { status: 400 },
        );
      }

      if (error.message.includes("No location found")) {
        return NextResponse.json(
          { error: "Address could not be geocoded" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 },
    );
  }
}

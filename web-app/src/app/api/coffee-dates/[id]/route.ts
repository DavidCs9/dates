import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/features/auth/utils/auth-middleware";
import { coffeeDateService } from "@/features/coffee-dates/services/coffee-date-service";
import { ItemNotFoundError } from "@/shared/lib";
import { AuthenticationError, ValidationError } from "@/shared/lib/errors";
import type { UpdateCoffeeDateRequest } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/coffee-dates/[id] - Get a specific coffee date by ID
 * Public endpoin
 * GET /api/coffee-dates/[id] - Get a specific coffee date by ID
 * Public endpoint (no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json(
        { error: "Coffee date ID is required" },
        { status: 400 },
      );
    }

    const coffeeDate = await coffeeDateService.getById(id);

    if (!coffeeDate) {
      return NextResponse.json(
        { error: "Coffee date not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(coffeeDate);
  } catch (error) {
    console.error(`Failed to get coffee date ${id}:`, error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          field: error.field,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve coffee date" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/coffee-dates/[id] - Update a coffee date
 * Protected endpoint (authentication required)
 */
export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: RouteParams,
  ): Promise<NextResponse> => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Coffee date ID is required" },
          { status: 400 },
        );
      }

      const body = await request.json();

      // Convert date strings back to Date objects if present
      const updateRequest: UpdateCoffeeDateRequest = {
        ...body,
        ...(body.visitDate && { visitDate: new Date(body.visitDate) }),
      };

      const updatedCoffeeDate = await coffeeDateService.update(
        id,
        updateRequest,
      );
      return NextResponse.json(updatedCoffeeDate);
    } catch (error) {
      console.error(`Failed to update coffee date ${id}:`, error);

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
        return NextResponse.json(
          { error: "Coffee date not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Failed to update coffee date" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/coffee-dates/[id] - Delete a coffee date
 * Protected endpoint (authentication required)
 */
export const DELETE = withAuth(
  async (
    _request: NextRequest,
    { params }: RouteParams,
  ): Promise<NextResponse> => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Coffee date ID is required" },
          { status: 400 },
        );
      }

      await coffeeDateService.delete(id);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error(`Failed to delete coffee date ${id}:`, error);

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
        return NextResponse.json(
          { error: "Coffee date not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Failed to delete coffee date" },
        { status: 500 },
      );
    }
  },
);

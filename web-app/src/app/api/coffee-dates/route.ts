import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/features/auth/utils/auth-middleware";
import { coffeeDateService } from "@/features/coffee-dates/services/coffee-date-service";
import {
  AuthenticationError,
  getErrorMessage,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import type { CreateCoffeeDateRequest } from "@/shared/types";

/**
 * GET /api/coffee-dates - Retrieve all coffee dates
 * Public endpoint (no authentication required)
 */
export async function GET(): Promise<NextResponse> {
  try {
    const coffeeDates = await coffeeDateService.getAll();
    return NextResponse.json(coffeeDates);
  } catch (error) {
    console.error("Failed to get coffee dates:", error);
    return NextResponse.json(
      { error: "Failed to retrieve coffee dates" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/coffee-dates - Create a new coffee date
 * Protected endpoint (authentication required)
 */
export const POST = withAuth(
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();

      // Convert date strings back to Date objects
      const createRequest: CreateCoffeeDateRequest = {
        ...body,
        visitDate: new Date(body.visitDate),
      };

      const coffeeDate = await coffeeDateService.create(createRequest);
      return NextResponse.json(coffeeDate, { status: 201 });
    } catch (error) {
      console.error("Failed to create coffee date:", error);

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
        { error: "Failed to create coffee date" },
        { status: 500 },
      );
    }
  },
);

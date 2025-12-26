import { type NextRequest, NextResponse } from "next/server";
import { authService } from "../services/auth-service";

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Middleware to protect API routes that require authentication
 * Returns the authenticated token if valid, throws AuthenticationError if not
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    throw new AuthenticationError("No authentication token provided");
  }

  const isValid = await authService.verifySession(token);

  if (!isValid) {
    throw new AuthenticationError("Invalid or expired authentication token");
  }

  return token;
}

/**
 * Higher-order function to wrap API route handlers with authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      await requireAuth(request);
      return handler(request, ...args);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

/**
 * Check if a request is authenticated without throwing errors
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    await requireAuth(request);
    return true;
  } catch {
    return false;
  }
}

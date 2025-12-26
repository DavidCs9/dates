import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/features/auth/services/auth-service";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = loginSchema.parse(body);

    const result = await authService.authenticate(password);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      expiresAt: result.expiresAt,
    });

    if (!result.token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      );
    }

    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

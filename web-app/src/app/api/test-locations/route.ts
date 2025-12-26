import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test the location search API
    const searchResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/locations/search?q=starbucks`,
    );

    if (!searchResponse.ok) {
      throw new Error(`Search API failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    return NextResponse.json({
      message: "Location services test completed successfully",
      searchResults: searchData.results?.length || 0,
      sampleResult: searchData.results?.[0] || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Location test error:", error);

    return NextResponse.json(
      {
        message: "Location services test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

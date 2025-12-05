import { NextRequest, NextResponse } from "next/server";
import { generateMigrationRecommendations } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { cveId, description, affectedProducts } = await request.json();

    if (!cveId || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recommendation = await generateMigrationRecommendations(
      cveId,
      description,
      affectedProducts || []
    );

    if (!recommendation) {
      return NextResponse.json(
        { error: "Could not generate recommendations" },
        { status: 500 }
      );
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error in migration recommendations API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

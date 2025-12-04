import { NextRequest, NextResponse } from "next/server";
import { getCVEDetails } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cveId = searchParams.get("id");

  if (!cveId) {
    return NextResponse.json({ error: "CVE ID is required" }, { status: 400 });
  }

  try {
    const details = await getCVEDetails(cveId);
    
    if (!details) {
      return NextResponse.json({ error: "CVE not found" }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Error in CVE details API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

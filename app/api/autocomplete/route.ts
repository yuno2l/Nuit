import { NextRequest, NextResponse } from "next/server";
import { searchCVEsFromNVD } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Search for CVEs matching the query
    const results = await searchCVEsFromNVD(query, 10);
    
    if (!results || !results.vulnerabilities) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = results.vulnerabilities.map((vuln) => ({
      id: vuln.cve.id,
      description: vuln.cve.descriptions.find((d) => d.lang === "en")?.value.substring(0, 100) + "..." || "",
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

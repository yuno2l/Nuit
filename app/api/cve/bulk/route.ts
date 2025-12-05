import { NextRequest, NextResponse } from "next/server";
import { getCVEDetails } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { cveIds } = await request.json();

    if (!cveIds || !Array.isArray(cveIds) || cveIds.length === 0) {
      return NextResponse.json(
        { error: "CVE IDs array is required" },
        { status: 400 }
      );
    }

    // Limit to 50 CVEs at once to prevent overload
    if (cveIds.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 CVEs can be processed at once" },
        { status: 400 }
      );
    }

    // Fetch all CVE details in parallel
    const results = await Promise.allSettled(
      cveIds.map(async (cveId) => {
        try {
          const details = await getCVEDetails(cveId);
          return { cveId, success: true, data: details };
        } catch (error) {
          return { cveId, success: false, error: "Failed to fetch CVE" };
        }
      })
    );

    const processed = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          cveId: "unknown",
          success: false,
          error: result.reason?.message || "Failed to fetch CVE",
        };
      }
    });

    const successful = processed.filter((r): r is { cveId: string; success: true; data: any } => 
      r.success && 'data' in r && r.data !== null
    );
    const failed = processed.filter((r) => !r.success || !('data' in r) || !r.data);

    return NextResponse.json({
      total: cveIds.length,
      successful: successful.length,
      failed: failed.length,
      results: successful.map((r) => r.data),
      errors: failed.map((r) => ({ cveId: r.cveId, error: 'error' in r ? r.error : 'Unknown error' })),
    });
  } catch (error) {
    console.error("Error in bulk CVE API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

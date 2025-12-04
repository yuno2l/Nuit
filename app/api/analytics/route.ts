import { NextRequest, NextResponse } from "next/server";
import { searchCVEsByDateRange, fetchEPSSScores, fetchKEVCatalog } from "@/lib/api";
import type { AnalyticsData, CVEDetails } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "Oracle";
  const months = parseInt(searchParams.get("months") || "6");

  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const pubStartDate = startDate.toISOString().split("T")[0] + "T00:00:00.000";
    const pubEndDate = endDate.toISOString().split("T")[0] + "T23:59:59.999";

    // Fetch CVEs
    const nvdData = await searchCVEsByDateRange(keyword, pubStartDate, pubEndDate, 100);
    
    if (!nvdData || !nvdData.vulnerabilities) {
      return NextResponse.json({
        totalCVEs: 0,
        avgCVSS: 0,
        avgEPSS: 0,
        kevCount: 0,
        topCVSS: [],
        topEPSS: [],
        cvssDistribution: [],
        cweDistribution: [],
        timeline: [],
      } as AnalyticsData);
    }

    // Get all CVE IDs for EPSS lookup
    const cveIds = nvdData.vulnerabilities.map((v) => v.cve.id);
    const epssData = await fetchEPSSScores(cveIds);
    const kevCatalog = await fetchKEVCatalog();

    // Process CVEs
    const cveDetails: CVEDetails[] = [];
    const cvssScores: number[] = [];
    const epssScores: number[] = [];
    const cweMap = new Map<string, number>();
    const timelineMap = new Map<string, { count: number; totalCVSS: number }>();

    for (const vuln of nvdData.vulnerabilities) {
      const cve = vuln.cve;
      const cvssV31 = cve.metrics.cvssMetricV31?.[0]?.cvssData;
      const cvssV2 = cve.metrics.cvssMetricV2?.[0]?.cvssData;
      const cvssScore = cvssV31?.baseScore || cvssV2?.baseScore || 0;
      const severity = cvssV31?.baseSeverity || cvssV2?.baseSeverity || "Unknown";
      
      const epssScore = epssData.get(cve.id);
      const kevEntry = kevCatalog?.vulnerabilities.find((v) => v.cveID === cve.id);
      
      const cwe = cve.weaknesses?.[0]?.description?.[0]?.value || "Unknown";
      const description = cve.descriptions.find((d) => d.lang === "en")?.value || "";

      if (cvssScore > 0) cvssScores.push(cvssScore);
      if (epssScore) epssScores.push(epssScore.epss);

      // CWE distribution
      cweMap.set(cwe, (cweMap.get(cwe) || 0) + 1);

      // Timeline
      const publishedDate = new Date(cve.published).toISOString().split("T")[0];
      const existing = timelineMap.get(publishedDate) || { count: 0, totalCVSS: 0 };
      timelineMap.set(publishedDate, {
        count: existing.count + 1,
        totalCVSS: existing.totalCVSS + cvssScore,
      });

      cveDetails.push({
        id: cve.id,
        description,
        published: cve.published,
        lastModified: cve.lastModified,
        cvssScore,
        severity,
        vectorString: cvssV31?.vectorString || cvssV2?.vectorString || "",
        epss: epssScore?.epss,
        epssPercentile: epssScore?.percentile,
        cwe,
        cweDescription: cwe,
        isKEV: !!kevEntry,
        kevDetails: kevEntry,
        references: cve.references || [],
        affectedProducts: [],
      });
    }

    // Calculate statistics
    const avgCVSS = cvssScores.length > 0
      ? cvssScores.reduce((a, b) => a + b, 0) / cvssScores.length
      : 0;
    
    const avgEPSS = epssScores.length > 0
      ? epssScores.reduce((a, b) => a + b, 0) / epssScores.length
      : 0;

    const kevCount = cveDetails.filter((c) => c.isKEV).length;

    // Top CVSS
    const topCVSS = [...cveDetails]
      .sort((a, b) => b.cvssScore - a.cvssScore)
      .slice(0, 10);

    // Top EPSS
    const topEPSS = [...cveDetails]
      .filter((c) => c.epss !== undefined)
      .sort((a, b) => (b.epss || 0) - (a.epss || 0))
      .slice(0, 10);

    // CVSS Distribution
    const cvssDistribution = [
      { severity: "None", count: cveDetails.filter((c) => c.cvssScore === 0).length },
      { severity: "Low", count: cveDetails.filter((c) => c.cvssScore > 0 && c.cvssScore < 4).length },
      { severity: "Medium", count: cveDetails.filter((c) => c.cvssScore >= 4 && c.cvssScore < 7).length },
      { severity: "High", count: cveDetails.filter((c) => c.cvssScore >= 7 && c.cvssScore < 9).length },
      { severity: "Critical", count: cveDetails.filter((c) => c.cvssScore >= 9).length },
    ].filter((d) => d.count > 0);

    // CWE Distribution (top 10)
    const cweDistribution = Array.from(cweMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Timeline
    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgCVSS: data.totalCVSS / data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const analyticsData: AnalyticsData = {
      totalCVEs: cveDetails.length,
      avgCVSS: Math.round(avgCVSS * 10) / 10,
      avgEPSS: Math.round(avgEPSS * 1000) / 1000,
      kevCount,
      topCVSS,
      topEPSS,
      cvssDistribution,
      cweDistribution,
      timeline,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

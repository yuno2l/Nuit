"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { TopCVSSChart } from "@/components/TopCVSSChart";
import { CVSSTimelineChart } from "@/components/CVSSTimelineChart";
import { CVSSDistributionChart } from "@/components/CVSSDistributionChart";
import { CWEDistributionList } from "@/components/CWEDistributionList";
import { Shield, TrendingUp, AlertCircle, Activity } from "lucide-react";
import type { AnalyticsData, CVEDetails } from "@/lib/types";
import { getCVSSColor, formatDate } from "@/lib/utils";

const PRESET_KEYWORDS = [
  { value: "Oracle", label: "Oracle" },
  { value: "SAP", label: "SAP" },
  { value: "VMware", label: "VMware" },
  { value: "Microsoft", label: "Microsoft" },
  { value: "Apache", label: "Apache" },
];

const TIME_PERIODS = [
  { value: "1", label: "Last Month" },
  { value: "3", label: "Last 3 Months" },
  { value: "6", label: "Last 6 Months" },
  { value: "12", label: "Last Year" },
];

export default function DashboardPage() {
  const [keyword, setKeyword] = useState("Oracle");
  const [months, setMonths] = useState("6");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [keyword, months]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics?keyword=${encodeURIComponent(keyword)}&months=${months}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-10 w-10 text-rimini-blue" />
          <h1 className="text-4xl font-bold">Threat Overview Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive vulnerability analytics and trends for enterprise security
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Select vendor/keyword and time period to analyze vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor/Keyword</label>
              <Select value={keyword} onValueChange={setKeyword}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_KEYWORDS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rimini-blue mx-auto"></div>
                <p className="text-muted-foreground">Loading analytics data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analytics Data */}
      {data && !loading && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total CVEs"
              value={data.totalCVEs}
              icon="shield"
              description={`Found in last ${months} month(s)`}
            />
            <StatsCard
              title="Average CVSS"
              value={data.avgCVSS.toFixed(1)}
              icon="alert"
              description="Mean severity score"
            />
            <StatsCard
              title="Average EPSS"
              value={`${(data.avgEPSS * 100).toFixed(2)}%`}
              icon="up"
              description="Mean exploitation probability"
            />
            <StatsCard
              title="KEV Vulnerabilities"
              value={data.kevCount}
              icon="alert"
              description="Known exploited in the wild"
            />
          </div>

          {/* Top CVSS Chart */}
          {data.topCVSS.length > 0 && (
            <TopCVSSChart data={data.topCVSS} />
          )}

          {/* Top EPSS List */}
          {data.topEPSS.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 EPSS Vulnerabilities</CardTitle>
                <CardDescription>
                  Highest probability of exploitation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topEPSS.map((cve, index) => (
                    <div
                      key={cve.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rimini-blue text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono font-semibold">{cve.id}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {cve.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">EPSS</div>
                          <div className="font-bold" style={{ color: getCVSSColor(cve.cvssScore) }}>
                            {((cve.epss || 0) * 100).toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">CVSS</div>
                          <div className="font-bold" style={{ color: getCVSSColor(cve.cvssScore) }}>
                            {cve.cvssScore.toFixed(1)}
                          </div>
                        </div>
                        {cve.isKEV && (
                          <Badge variant="destructive" className="ml-2">
                            KEV
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.cvssDistribution.length > 0 && (
              <CVSSDistributionChart data={data.cvssDistribution} />
            )}
            {data.cweDistribution.length > 0 && (
              <CWEDistributionList data={data.cweDistribution} />
            )}
          </div>

          {/* Timeline */}
          {data.timeline.length > 0 && (
            <CVSSTimelineChart data={data.timeline} />
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <span className="font-semibold">Total Vulnerabilities:</span> {data.totalCVEs} CVEs
                  found for <span className="font-mono">{keyword}</span> in the last {months} month(s).
                </p>
                <p>
                  <span className="font-semibold">Severity Analysis:</span> The average CVSS score
                  is {data.avgCVSS.toFixed(1)}, indicating{" "}
                  {data.avgCVSS < 4
                    ? "low"
                    : data.avgCVSS < 7
                    ? "medium"
                    : data.avgCVSS < 9
                    ? "high"
                    : "critical"}{" "}
                  overall severity.
                </p>
                <p>
                  <span className="font-semibold">Exploitation Risk:</span> The average EPSS score
                  is {(data.avgEPSS * 100).toFixed(2)}%, with {data.kevCount} vulnerabilities
                  actively exploited in the wild (KEV).
                </p>
                {data.topCVSS.length > 0 && (
                  <p>
                    <span className="font-semibold">Most Severe:</span>{" "}
                    <span className="font-mono">{data.topCVSS[0].id}</span> with CVSS score{" "}
                    {data.topCVSS[0].cvssScore.toFixed(1)}.
                  </p>
                )}
                {data.topEPSS.length > 0 && (
                  <p>
                    <span className="font-semibold">Highest Exploitation Probability:</span>{" "}
                    <span className="font-mono">{data.topEPSS[0].id}</span> with{" "}
                    {((data.topEPSS[0].epss || 0) * 100).toFixed(2)}% EPSS score.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

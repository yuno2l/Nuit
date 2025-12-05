"use client";

import React, { useState } from "react";
import { Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CVEInput from "@/components/CVEInput";
import CVECard from "@/components/CVECard";
import type { CVEDetails } from "@/lib/types";

export default function Home() {
  const [cveIds, setCveIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cveDataList, setCveDataList] = useState<CVEDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number } | null>(null);

  const searchCVEs = async () => {
    if (cveIds.length === 0) return;

    setLoading(true);
    setError(null);
    setCveDataList([]);
    setStats(null);

    try {
      const response = await fetch('/api/cve/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CVEs");
      }

      const data = await response.json();
      setCveDataList(data.results || []);
      setStats({
        total: data.total,
        successful: data.successful,
        failed: data.failed,
      });

      if (data.failed > 0) {
        console.warn("Some CVEs failed to load:", data.errors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CVE data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-12 w-12 text-rimini-blue" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rimini-blue to-rimini-lightblue bg-clip-text text-transparent">
            CVE Explorer
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Visual Threat Intelligence Platform for Enterprise Security
        </p>
      </div>

      {/* Search Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Search CVEs</CardTitle>
          <CardDescription>
            Enter CVE IDs, use autocomplete, or upload a file (TXT, CSV, XLSX)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CVEInput onCVEsChange={setCveIds} />
          <Button 
            onClick={searchCVEs} 
            disabled={loading || cveIds.length === 0}
            className="w-full"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Analyzing..." : `Analyze ${cveIds.length} CVE${cveIds.length !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="max-w-3xl mx-auto border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {stats && cveDataList.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Requested</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
                <div className="text-sm text-muted-foreground">Successfully Loaded</div>
              </div>
              {stats.failed > 0 && (
                <div>
                  <div className="text-3xl font-bold text-destructive">{stats.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CVE Results */}
      {cveDataList.length > 0 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          {cveDataList.map((cveData, index) => (
            <CVECard key={cveData.id} cveData={cveData} defaultExpanded={cveDataList.length === 1} />
          ))}
        </div>
      )}

      {/* Getting Started */}
      {cveDataList.length === 0 && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Critical Vulnerabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCveIds(["CVE-2021-44228", "CVE-2023-21839", "CVE-2023-34048"]);
                }}
              >
                Load 3 Critical CVEs
              </Button>
              <p className="text-xs text-muted-foreground">Log4Shell, Oracle WebLogic, VMware vCenter</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Windows Vulnerabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCveIds(["CVE-2023-21839"]);
                }}
              >
                Try Oracle Example
              </Button>
              <p className="text-xs text-muted-foreground">See NIRD migration recommendations</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

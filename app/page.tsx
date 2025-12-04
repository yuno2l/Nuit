"use client";

import React, { useState } from "react";
import { Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CVSSGauge } from "@/components/CVSSGauge";
import { EPSSMeter } from "@/components/EPSSMeter";
import { formatDate } from "@/lib/utils";
import type { CVEDetails } from "@/lib/types";

export default function Home() {
  const [cveId, setCveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cveData, setCveData] = useState<CVEDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchCVE = async () => {
    if (!cveId.trim()) return;

    setLoading(true);
    setError(null);
    setCveData(null);

    try {
      const response = await fetch(`/api/cve?id=${encodeURIComponent(cveId.trim())}`);
      if (!response.ok) {
        throw new Error("CVE not found");
      }
      const data = await response.json();
      setCveData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CVE data");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchCVE();
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
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Search CVE</CardTitle>
          <CardDescription>
            Enter a CVE ID (e.g., CVE-2024-1234) to analyze vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="CVE-2024-1234"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchCVE} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
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

      {/* CVE Details */}
      {cveData && (
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{cveData.id}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={cveData.isKEV ? "destructive" : "secondary"}>
                      {cveData.isKEV ? "🚨 Known Exploited" : "Not in KEV"}
                    </Badge>
                    {cveData.cwe && (
                      <Badge variant="outline">{cveData.cwe}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription className="text-base mt-4">
                {cveData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Published:</span>
                  <p className="font-medium">{formatDate(cveData.published)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Modified:</span>
                  <p className="font-medium">{formatDate(cveData.lastModified)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vector String:</span>
                  <p className="font-mono text-xs">{cveData.vectorString || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CVSSGauge score={cveData.cvssScore} />
            {cveData.epss !== undefined && (
              <EPSSMeter epss={cveData.epss} percentile={cveData.epssPercentile || 0} />
            )}
          </div>

          {/* KEV Details */}
          {cveData.isKEV && cveData.kevDetails && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  ⚠️ Known Exploited Vulnerability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Vulnerability Name</h4>
                    <p>{cveData.kevDetails.vulnerabilityName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p>{cveData.kevDetails.shortDescription}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Vendor/Project</h4>
                      <p>{cveData.kevDetails.vendorProject}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Product</h4>
                      <p>{cveData.kevDetails.product}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Date Added to KEV</h4>
                      <p>{formatDate(cveData.kevDetails.dateAdded)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Due Date</h4>
                      <p>{formatDate(cveData.kevDetails.dueDate)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Required Action</h4>
                    <p>{cveData.kevDetails.requiredAction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CWE Details */}
          {cveData.cwe && (
            <Card>
              <CardHeader>
                <CardTitle>Weakness Type (CWE)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-mono text-sm">{cveData.cwe}</p>
                  <p className="text-muted-foreground">{cveData.cweDescription}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {cveData.references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cveData.references.map((ref, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-muted-foreground min-w-[100px]">
                        {ref.source}
                      </span>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rimini-blue hover:underline break-all"
                      >
                        {ref.url}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Getting Started */}
      {!cveData && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Try Popular CVEs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCveId("CVE-2021-44228");
                  setTimeout(() => searchCVE(), 100);
                }}
              >
                CVE-2021-44228
              </Button>
              <p className="text-xs text-muted-foreground">Log4Shell</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Oracle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCveId("CVE-2023-21839");
                  setTimeout(() => searchCVE(), 100);
                }}
              >
                CVE-2023-21839
              </Button>
              <p className="text-xs text-muted-foreground">Oracle WebLogic</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">VMware</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCveId("CVE-2023-34048");
                  setTimeout(() => searchCVE(), 100);
                }}
              >
                CVE-2023-34048
              </Button>
              <p className="text-xs text-muted-foreground">vCenter Server</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

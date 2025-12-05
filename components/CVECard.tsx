"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CVSSGauge } from "@/components/CVSSGauge";
import { EPSSMeter } from "@/components/EPSSMeter";
import NIRDRecommendations from "@/components/NIRDRecommendations";
import { formatDate } from "@/lib/utils";
import { detectProprietarySoftware } from "@/lib/gemini";
import type { CVEDetails } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CVECardProps {
  cveData: CVEDetails;
  defaultExpanded?: boolean;
}

export default function CVECard({ cveData, defaultExpanded = false }: CVECardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const detection = detectProprietarySoftware(
    cveData.description,
    cveData.references,
    cveData.affectedProducts
  );

  return (
    <div className="space-y-4">
      {/* Header Card - Always Visible */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpanded(!expanded)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{cveData.id}</CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <Badge
                  variant={
                    cveData.cvssScore >= 9
                      ? "destructive"
                      : cveData.cvssScore >= 7
                      ? "default"
                      : "secondary"
                  }
                >
                  CVSS {cveData.cvssScore.toFixed(1)}
                </Badge>
                <Badge variant={cveData.isKEV ? "destructive" : "outline"}>
                  {cveData.isKEV ? "🚨 KEV" : "Not in KEV"}
                </Badge>
                {cveData.cwe && <Badge variant="outline">{cveData.cwe}</Badge>}
                {detection.isProprietary && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20">
                    Proprietary Software
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <CardDescription className="text-base mt-2 line-clamp-2">
            {cveData.description}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-6 pl-4 border-l-2">
          {/* Full Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{cveData.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t">
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

          {/* NIRD Recommendations */}
          {detection.isProprietary && (
            <NIRDRecommendations
              cveId={cveData.id}
              description={cveData.description}
              affectedProducts={cveData.affectedProducts || []}
              isWindows={detection.isWindows}
              isOracle={detection.isOracle}
            />
          )}
        </div>
      )}
    </div>
  );
}

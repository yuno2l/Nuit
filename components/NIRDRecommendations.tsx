"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, ExternalLink, Shield, MessageSquare } from "lucide-react";
import MigrationChat from "@/components/MigrationChat";
import type { MigrationRecommendation } from "@/lib/gemini";

interface NIRDRecommendationsProps {
  cveId: string;
  description: string;
  affectedProducts: string[];
  isWindows: boolean;
  isOracle: boolean;
}

export default function NIRDRecommendations({
  cveId,
  description,
  affectedProducts,
  isWindows,
  isOracle,
}: NIRDRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<MigrationRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/migration/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cveId, description, affectedProducts }),
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [cveId, description, affectedProducts]);

  if (!isWindows && !isOracle) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Digital Dependency Warning */}
      <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
            <div className="flex-1">
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Digital Dependency Risk
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300 mt-1">
                This vulnerability affects {isWindows && "Windows"}
                {isWindows && isOracle && "/"}
                {isOracle && "Oracle"} products, highlighting risks from
                proprietary software dependencies.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Consider <strong>NIRD</strong> principles
              for digital sovereignty and open-source alternatives.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Recommendations */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generating migration recommendations...
            </p>
          </CardContent>
        </Card>
      ) : recommendation ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Open-Source Migration Recommendations
            </CardTitle>
            <CardDescription>
              Alternatives to reduce digital dependency and improve sovereignty
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Open Source Alternatives */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Recommended Alternatives
              </h4>
              <div className="space-y-3">
                {recommendation.openSourceAlternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{alt.name}</h5>
                          <Badge
                            variant={
                              alt.maturity === "mature"
                                ? "default"
                                : alt.maturity === "stable"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {alt.maturity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alt.description}</p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={alt.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Migration Complexity */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Migration Complexity:</span>
              <Badge
                variant={
                  recommendation.migrationComplexity === "low"
                    ? "default"
                    : recommendation.migrationComplexity === "medium"
                    ? "secondary"
                    : "destructive"
                }
              >
                {recommendation.migrationComplexity}
              </Badge>
            </div>

            {/* Key Considerations */}
            <div>
              <h4 className="font-semibold mb-2">Key Considerations</h4>
              <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                {recommendation.keyConsiderations.map((consideration, idx) => (
                  <li key={idx}>{consideration}</li>
                ))}
              </ul>
            </div>

            {/* Durable Integration Tips */}
            <div>
              <h4 className="font-semibold mb-2">Durable Integration Strategies</h4>
              <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                {recommendation.durableIntegrationTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Chat Button */}
            <Button onClick={() => setShowChat(!showChat)} className="w-full" size="lg">
              <MessageSquare className="h-4 w-4 mr-2" />
              {showChat ? "Hide" : "Get Personalized"} Migration Assistance
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Inline Chat */}
      {showChat && (
        <MigrationChat
          cveId={cveId}
          affectedProducts={affectedProducts}
          inline={true}
        />
      )}
    </div>
  );
}

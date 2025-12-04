"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEPSSColor } from "@/lib/utils";

interface EPSSMeterProps {
  epss: number;
  percentile: number;
  className?: string;
}

export function EPSSMeter({ epss, percentile, className }: EPSSMeterProps) {
  const percentage = epss * 100;
  const color = getEPSSColor(epss);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">EPSS Probability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exploitation Probability</span>
              <span className="font-semibold" style={{ color }}>
                {percentage.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Percentile</span>
            <span className="text-lg font-semibold">
              {(percentile * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Higher EPSS scores indicate a greater probability of exploitation in the wild.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

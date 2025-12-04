"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCVSSColor, getCVSSSeverity } from "@/lib/utils";

interface CVSSGaugeProps {
  score: number;
  className?: string;
}

export function CVSSGauge({ score, className }: CVSSGaugeProps) {
  const color = getCVSSColor(score);
  const severity = getCVSSSeverity(score);
  const percentage = (score / 10) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">CVSS Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={color}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ color }}>
                {score.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-lg font-semibold"
              style={{ color }}
            >
              {severity}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

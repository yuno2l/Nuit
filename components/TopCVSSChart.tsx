"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCVSSColor } from "@/lib/utils";
import type { CVEDetails } from "@/lib/types";

interface TopCVSSChartProps {
  data: CVEDetails[];
  className?: string;
}

export function TopCVSSChart({ data, className }: TopCVSSChartProps) {
  const chartData = data.map((cve) => ({
    id: cve.id,
    score: cve.cvssScore,
    color: getCVSSColor(cve.cvssScore),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top 10 CVSS Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 10]} />
            <YAxis type="category" dataKey="id" width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

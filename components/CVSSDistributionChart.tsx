"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCVSSColor } from "@/lib/utils";

interface DistributionData {
  severity: string;
  count: number;
}

interface CVSSDistributionChartProps {
  data: DistributionData[];
  className?: string;
}

const COLORS: Record<string, string> = {
  None: "#4A5568",
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#F97316",
  Critical: "#EF4444",
};

export function CVSSDistributionChart({ data, className }: CVSSDistributionChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>CVSS Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ severity, percent }) =>
                `${severity}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.severity] || "#4A5568"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

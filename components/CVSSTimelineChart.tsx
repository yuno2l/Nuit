"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface TimelineData {
  date: string;
  count: number;
  avgCVSS: number;
}

interface CVSSTimelineChartProps {
  data: TimelineData[];
  className?: string;
}

export function CVSSTimelineChart({ data, className }: CVSSTimelineChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), "MMM dd"),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>CVSS Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis yAxisId="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 10]}
              label={{ value: "Avg CVSS", angle: 90, position: "insideRight" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="CVE Count"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgCVSS"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Avg CVSS Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

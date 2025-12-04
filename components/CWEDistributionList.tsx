"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CWEDistributionData {
  name: string;
  count: number;
}

interface CWEDistributionListProps {
  data: CWEDistributionData[];
  className?: string;
}

export function CWEDistributionList({ data, className }: CWEDistributionListProps) {
  const maxCount = Math.max(...data.map((item) => item.count));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top CWE Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate max-w-[70%]">{item.name}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-rimini-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

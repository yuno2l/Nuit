"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: "up" | "down" | "shield" | "alert";
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, description, className }: StatsCardProps) {
  const icons = {
    up: <TrendingUp className="h-5 w-5 text-green-500" />,
    down: <TrendingDown className="h-5 w-5 text-red-500" />,
    shield: <Shield className="h-5 w-5 text-blue-500" />,
    alert: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && icons[icon]}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

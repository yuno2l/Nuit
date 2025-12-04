import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getCVSSColor(score: number): string {
  if (score === 0) return "#4A5568"; // None
  if (score < 4) return "#10B981"; // Low - Green
  if (score < 7) return "#F59E0B"; // Medium - Yellow
  if (score < 9) return "#F97316"; // High - Orange
  return "#EF4444"; // Critical - Red
}

export function getCVSSSeverity(score: number): string {
  if (score === 0) return "None";
  if (score < 4) return "Low";
  if (score < 7) return "Medium";
  if (score < 9) return "High";
  return "Critical";
}

export function getEPSSColor(probability: number): string {
  if (probability < 0.1) return "#10B981"; // Low
  if (probability < 0.5) return "#F59E0B"; // Medium
  if (probability < 0.8) return "#F97316"; // High
  return "#EF4444"; // Critical
}

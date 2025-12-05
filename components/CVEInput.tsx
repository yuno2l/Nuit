"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Search, Loader2 } from "lucide-react";
import { parseUploadedFile, validateCveId } from "@/lib/fileParser";

interface CVEInputProps {
  onCVEsChange: (cveIds: string[]) => void;
}

export default function CVEInput({ onCVEsChange }: CVEInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [cveIds, setCveIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; description: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onCVEsChange(cveIds);
  }, [cveIds, onCVEsChange]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(inputValue)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions?.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue]);

  const addCVE = (cveId: string) => {
    const normalizedId = cveId.toUpperCase().trim();
    if (validateCveId(normalizedId) && !cveIds.includes(normalizedId)) {
      setCveIds([...cveIds, normalizedId]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeCVE = (cveId: string) => {
    setCveIds(cveIds.filter(id => id !== cveId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addCVE(inputValue);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedCVEs = await parseUploadedFile(file);
      const newCVEs = parsedCVEs.filter(id => !cveIds.includes(id));
      setCveIds([...cveIds, ...newCVEs]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(error instanceof Error ? error.message : "Error parsing file");
    }
  };

  const handleSuggestionClick = (suggestion: { id: string; description: string }) => {
    addCVE(suggestion.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Type CVE ID (e.g., CVE-2024-1234) or keyword..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium text-sm">{suggestion.id}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {suggestion.description}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Button onClick={() => inputValue.trim() && addCVE(inputValue)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.xls,.xlsx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* CVE Tags */}
      {cveIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
          {cveIds.map((cveId) => (
            <Badge key={cveId} variant="secondary" className="pl-2 pr-1">
              {cveId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => removeCVE(cveId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Badge variant="outline" className="font-normal">
            {cveIds.length} CVE{cveIds.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}
    </div>
  );
}

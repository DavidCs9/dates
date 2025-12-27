"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CafeInfo,
  LocationPickerProps,
  PlaceSearchResult,
} from "../types";

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a café...",
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    CafeInfo | undefined
  >(initialLocation);
  const [error, setError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Get user's location on mount for location-biased search (using ref to avoid re-renders)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocationRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (err) => {
          console.log("Geolocation not available:", err.message);
        },
      );
    }
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build URL with optional location bias for better local results
      let url = `/api/locations/search?q=${encodeURIComponent(searchQuery)}`;
      if (userLocationRef.current) {
        url += `&lat=${userLocationRef.current.lat}&lng=${userLocationRef.current.lng}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await searchPlaces(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchPlaces]);

  const handleLocationSelect = async (result: PlaceSearchResult) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/locations/details?placeId=${encodeURIComponent(result.placeId)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get location details");
      }

      const data = await response.json();
      const locationDetails: CafeInfo = data.place;

      setSelectedLocation(locationDetails);
      setQuery(locationDetails.name);
      setIsOpen(false);
      setResults([]); // Clear results after selection
      onLocationSelect(locationDetails);
    } catch (err) {
      console.error("Location details error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to get location details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedLocation(undefined);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className={cn(
            "pl-10 pr-10",
            error && "border-destructive focus-visible:ring-destructive/20",
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {selectedLocation && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={clearSelection}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

      {selectedLocation && (
        <div className="mt-2">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100 truncate">
                    {selectedLocation.name}
                  </p>
                  <p
                    className="text-sm text-green-700 dark:text-green-300 line-clamp-2"
                    title={selectedLocation.formattedAddress}
                  >
                    {selectedLocation.formattedAddress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Card className="max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {results.map((result) => (
                <button
                  key={result.placeId}
                  type="button"
                  onClick={() => handleLocationSelect(result)}
                  className="w-full p-3 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none border-b border-border last:border-b-0"
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{result.name}</p>
                      <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        title={result.formattedAddress}
                      >
                        {result.formattedAddress}
                      </p>
                      {result.types.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.types.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {isOpen &&
        results.length === 0 &&
        query.trim().length >= 2 &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1">
            <Card>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground text-center">
                  No cafés found for "{query}"
                </p>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}

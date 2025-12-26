"use client";

import { AlertCircle, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { CafeInfo } from "../types";

interface MapPreviewProps {
  location: CafeInfo;
  height?: number;
  zoom?: number;
  className?: string;
}

export function MapPreview({
  location,
  height = 200,
  zoom = 15,
  className,
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key not configured");
        }

        // Load Google Maps API if not already loaded
        if (!window.google) {
          await loadGoogleMapsScript(apiKey);
        }

        // Create the map
        const map = new google.maps.Map(mapRef.current, {
          center: {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
          },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: "cooperative",
        });

        // Create a marker
        const marker = new google.maps.Marker({
          position: {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
          },
          map,
          title: location.name,
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${location.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${location.formattedAddress}</p>
            </div>
          `,
        });

        // Show info window on marker click
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setIsLoading(false);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to load map");
        setIsLoading(false);
      }
    };

    const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.google) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps script"));

        document.head.appendChild(script);
      });
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [location, zoom]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div
            className="flex items-center justify-center gap-2 text-muted-foreground"
            style={{ height: `${height}px` }}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Unable to load map</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative overflow-hidden">
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10"
            style={{ height: `${height}px` }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-sm">Loading map...</span>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          style={{ height: `${height}px` }}
          className="w-full rounded-lg"
        />
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium truncate max-w-[150px]">
              {location.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

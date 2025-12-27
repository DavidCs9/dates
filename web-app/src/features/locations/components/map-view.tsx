"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { CoffeeDate } from "@/shared/types";

interface MapViewProps {
  coffeeDates: CoffeeDate[];
  onMarkerClick?: (coffeeDate: CoffeeDate) => void;
  className?: string;
}

interface MarkerData {
  marker: google.maps.Marker;
  coffeeDate: CoffeeDate;
  infoWindow: google.maps.InfoWindow;
}

// Load Google Maps script dynamically
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      // Wait for existing script to load
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });
};

export function MapView({
  coffeeDates,
  onMarkerClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        if (!mapRef.current) return;

        // Load Google Maps script
        await loadGoogleMapsScript();

        if (!isMounted) return;

        // Calculate center and bounds
        const bounds = new google.maps.LatLngBounds();
        const validLocations = coffeeDates.filter(
          (date) =>
            date.cafeInfo.coordinates.lat && date.cafeInfo.coordinates.lng,
        );

        if (validLocations.length === 0) {
          setError("No locations to display on map");
          setIsLoading(false);
          return;
        }

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: validLocations[0].cafeInfo.coordinates,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(({ marker, infoWindow }) => {
          marker.setMap(null);
          infoWindow.close();
        });
        markersRef.current = [];

        // Create markers for each coffee date
        validLocations.forEach((coffeeDate) => {
          const position = {
            lat: coffeeDate.cafeInfo.coordinates.lat,
            lng: coffeeDate.cafeInfo.coordinates.lng,
          };

          bounds.extend(position);

          // Create custom marker icon
          const marker = new google.maps.Marker({
            position,
            map,
            title: coffeeDate.cafeInfo.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#f59e0b", // amber-500
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });

          // Create info window content
          const primaryPhoto =
            coffeeDate.photos.find(
              (photo) => photo.id === coffeeDate.primaryPhotoId,
            ) || coffeeDate.photos[0];

          const infoWindowContent = `
            <div class="p-3 max-w-xs">
              <div class="flex flex-col gap-3">
                ${
                  primaryPhoto
                    ? `
                  <img 
                    src="${primaryPhoto.thumbnailUrl}" 
                    alt="${coffeeDate.cafeInfo.name}"
                    class="w-full h-32 object-cover rounded-lg"
                    loading="lazy"
                  />
                `
                    : ""
                }
                <div>
                  <h3 class="font-semibold text-lg text-gray-900 mb-1">${coffeeDate.cafeInfo.name}</h3>
                  <p class="text-sm text-gray-600 mb-2">${coffeeDate.cafeInfo.formattedAddress}</p>
                  <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1">
                      <span class="text-gray-700">☕</span>
                      <span class="font-medium">${coffeeDate.ratings.coffee}/5</span>
                    </div>
                    ${
                      coffeeDate.ratings.dessert
                        ? `
                      <div class="flex items-center gap-1">
                        <span class="text-gray-700">🧁</span>
                        <span class="font-medium">${coffeeDate.ratings.dessert}/5</span>
                      </div>
                    `
                        : ""
                    }
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    ${new Date(coffeeDate.visitDate).toLocaleDateString("es", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </div>
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
          });

          // Add click listener
          marker.addListener("click", () => {
            // Close all other info windows
            markersRef.current.forEach(({ infoWindow: iw }) => {
              if (iw !== infoWindow) {
                iw.close();
              }
            });

            infoWindow.open(map, marker);

            if (onMarkerClick) {
              onMarkerClick(coffeeDate);
            }
          });

          markersRef.current.push({ marker, coffeeDate, infoWindow });
        });

        // Fit map to show all markers
        if (validLocations.length > 1) {
          map.fitBounds(bounds);

          // Ensure minimum zoom level
          const listener = google.maps.event.addListener(map, "idle", () => {
            if (map.getZoom() && map.getZoom()! > 15) {
              map.setZoom(15);
            }
            google.maps.event.removeListener(listener);
          });
        } else {
          map.setZoom(15);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize map:", err);
        if (isMounted) {
          setError(
            "Failed to load map. Please check your internet connection.",
          );
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Cleanup markers
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
      markersRef.current = [];
    };
  }, [coffeeDates, onMarkerClick]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Map Unavailable
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg"
        />
        {coffeeDates.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-muted-foreground">
            {coffeeDates.length} location{coffeeDates.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { getRequiredEnv } from "@/shared/lib";
import type { CafeInfo, LocationService, PlaceSearchResult } from "../types";

class GoogleMapsLocationService implements LocationService {
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private isInitialized = false;
  private apiKey: string;

  constructor() {
    this.apiKey = getRequiredEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google Maps API dynamically
      if (!window.google) {
        await this.loadGoogleMapsScript();
      }

      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement("div");
      this.placesService = new google.maps.places.PlacesService(dummyDiv);
      this.geocoder = new google.maps.Geocoder();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Google Maps:", error);
      throw new Error("Failed to initialize Google Maps API");
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geocoding&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Maps script"));

      document.head.appendChild(script);
    });
  }

  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    await this.initialize();

    if (!this.placesService) {
      throw new Error("Places service not initialized");
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query: `${query} cafe coffee shop`,
        type: "cafe",
      };

      if (!this.placesService) {
        reject(new Error("Places service not initialized"));
        return;
      }

      this.placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const searchResults: PlaceSearchResult[] = results
            .filter(
              (place) =>
                place.place_id && place.name && place.formatted_address,
            )
            .map((place) => ({
              placeId: place.place_id || "",
              name: place.name || "",
              formattedAddress: place.formatted_address || "",
              types: place.types || [],
            }));

          resolve(searchResults);
        } else {
          console.error("Places search failed:", status);
          reject(new Error(`Places search failed with status: ${status}`));
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<CafeInfo> {
    await this.initialize();

    if (!this.placesService) {
      throw new Error("Places service not initialized");
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ["place_id", "name", "formatted_address", "geometry", "types"],
      };

      if (!this.placesService) {
        reject(new Error("Places service not initialized"));
        return;
      }

      this.placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (
            !place.place_id ||
            !place.name ||
            !place.formatted_address ||
            !place.geometry?.location
          ) {
            reject(new Error("Incomplete place details received"));
            return;
          }

          const cafeInfo: CafeInfo = {
            placeId: place.place_id,
            name: place.name,
            formattedAddress: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            types: place.types || [],
          };

          resolve(cafeInfo);
        } else {
          console.error("Place details request failed:", status);
          reject(
            new Error(`Place details request failed with status: ${status}`),
          );
        }
      });
    });
  }

  async geocodeAddress(address: string): Promise<CafeInfo> {
    await this.initialize();

    if (!this.geocoder) {
      throw new Error("Geocoder service not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        reject(new Error("Geocoder service not initialized"));
        return;
      }

      this.geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];

          if (!result.geometry?.location) {
            reject(new Error("No location found for address"));
            return;
          }

          const cafeInfo: CafeInfo = {
            placeId: result.place_id || "",
            name: address, // Use the input address as name for geocoded results
            formattedAddress: result.formatted_address,
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
            types: result.types || [],
          };

          resolve(cafeInfo);
        } else {
          console.error("Geocoding failed:", status);
          reject(new Error(`Geocoding failed with status: ${status}`));
        }
      });
    });
  }
}

// Singleton instance
let locationServiceInstance: GoogleMapsLocationService | null = null;

export function getLocationService(): LocationService {
  if (!locationServiceInstance) {
    locationServiceInstance = new GoogleMapsLocationService();
  }
  return locationServiceInstance;
}

export { GoogleMapsLocationService };

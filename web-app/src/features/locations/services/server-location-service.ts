import { getRequiredEnv } from "@/shared/lib";
import type { CafeInfo, LocationService, PlaceSearchResult } from "../types";

class ServerLocationService implements LocationService {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api";

  constructor() {
    this.apiKey = getRequiredEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  }

  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    try {
      // Use a more targeted search query to reduce duplicates
      const searchQuery = query.toLowerCase().includes('cafe') || query.toLowerCase().includes('coffee') 
        ? query 
        : `${query} cafe`;
      const url = `${this.baseUrl}/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=cafe&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Places search failed:", data.status, data.error_message);
        throw new Error(`Places search failed with status: ${data.status}`);
      }

      // Filter and map results
      const mappedResults: PlaceSearchResult[] = data.results
        .filter(
          (place: any) =>
            place.place_id && place.name && place.formatted_address,
        )
        .map((place: any) => ({
          placeId: place.place_id,
          name: place.name,
          formattedAddress: place.formatted_address,
          types: place.types || [],
        }));

      // Deduplicate by placeId to avoid duplicate entries
      const uniqueResults = mappedResults.filter(
        (result, index, array) =>
          array.findIndex((r) => r.placeId === result.placeId) === index,
      );

      return uniqueResults;
    } catch (error) {
      console.error("Error searching places:", error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<CafeInfo> {
    try {
      const fields = "place_id,name,formatted_address,geometry,types";
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error(
          "Place details request failed:",
          data.status,
          data.error_message,
        );
        throw new Error(
          `Place details request failed with status: ${data.status}`,
        );
      }

      const place = data.result;
      if (
        !place.place_id ||
        !place.name ||
        !place.formatted_address ||
        !place.geometry?.location
      ) {
        throw new Error("Incomplete place details received");
      }

      const cafeInfo: CafeInfo = {
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        types: place.types || [],
      };

      return cafeInfo;
    } catch (error) {
      console.error("Error getting place details:", error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<CafeInfo> {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Geocoding failed:", data.status, data.error_message);
        throw new Error(`Geocoding failed with status: ${data.status}`);
      }

      const result = data.results[0];
      if (!result?.geometry?.location) {
        throw new Error("No location found for address");
      }

      const cafeInfo: CafeInfo = {
        placeId: result.place_id || "",
        name: address, // Use the input address as name for geocoded results
        formattedAddress: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        types: result.types || [],
      };

      return cafeInfo;
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    }
  }
}

export { ServerLocationService };

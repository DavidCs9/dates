import type { CafeInfo, PlaceSearchResult } from "@/shared/types";

export interface LocationService {
  searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
  ): Promise<PlaceSearchResult[]>;
  getPlaceDetails(placeId: string): Promise<CafeInfo>;
  geocodeAddress(address: string): Promise<CafeInfo>;
}

export interface LocationPickerProps {
  onLocationSelect: (location: CafeInfo) => void;
  initialLocation?: CafeInfo;
  placeholder?: string;
}

export * from "@/shared/types";

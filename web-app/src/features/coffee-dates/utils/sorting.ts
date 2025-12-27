import type { CoffeeDate } from "@/shared/types";

export type SortOption =
  | "visitDate-desc" // Newest visits first (default)
  | "visitDate-asc" // Oldest visits first
  | "createdAt-desc" // Recently added first
  | "createdAt-asc" // Oldest entries first
  | "coffee-rating-desc" // Best coffee first
  | "coffee-rating-asc" // Worst coffee first
  | "dessert-rating-desc" // Best dessert first
  | "dessert-rating-asc" // Worst dessert first
  | "cafe-name-asc" // Alphabetical by café name
  | "cafe-name-desc"; // Reverse alphabetical

export interface SortConfig {
  option: SortOption;
  label: string;
  description: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  {
    option: "visitDate-desc",
    label: "Más recientes",
    description: "Most recent coffee dates first",
  },
  {
    option: "visitDate-asc",
    label: "Menos recientes",
    description: "Earliest coffee dates first",
  },
  {
    option: "coffee-rating-desc",
    label: "Mejor café",
    description: "Highest coffee ratings first",
  },
  {
    option: "coffee-rating-asc",
    label: "Peor café",
    description: "Lowest coffee ratings first",
  },
  {
    option: "dessert-rating-desc",
    label: "Mejor postre",
    description: "Highest dessert ratings first",
  },
  {
    option: "dessert-rating-asc",
    label: "Peor postre",
    description: "Lowest dessert ratings first",
  },
  {
    option: "cafe-name-asc",
    label: "Café A-Z",
    description: "Alphabetical by café name",
  },
  {
    option: "cafe-name-desc",
    label: "Café Z-A",
    description: "Reverse alphabetical by café name",
  },
];

/**
 * Sort coffee dates based on the selected option
 */
export function sortCoffeeDates(
  coffeeDates: CoffeeDate[],
  sortOption: SortOption,
): CoffeeDate[] {
  const sorted = [...coffeeDates];

  switch (sortOption) {
    case "visitDate-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
      );

    case "visitDate-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime(),
      );

    case "coffee-rating-desc":
      return sorted.sort((a, b) => b.ratings.coffee - a.ratings.coffee);

    case "coffee-rating-asc":
      return sorted.sort((a, b) => a.ratings.coffee - b.ratings.coffee);

    case "dessert-rating-desc":
      return sorted.sort((a, b) => {
        const aRating = a.ratings.dessert ?? 0;
        const bRating = b.ratings.dessert ?? 0;
        return bRating - aRating;
      });

    case "dessert-rating-asc":
      return sorted.sort((a, b) => {
        const aRating = a.ratings.dessert ?? 0;
        const bRating = b.ratings.dessert ?? 0;
        return aRating - bRating;
      });

    case "cafe-name-asc":
      return sorted.sort((a, b) =>
        a.cafeInfo.name.localeCompare(b.cafeInfo.name),
      );

    case "cafe-name-desc":
      return sorted.sort((a, b) =>
        b.cafeInfo.name.localeCompare(a.cafeInfo.name),
      );

    default:
      return sorted;
  }
}

/**
 * Get the sort configuration for a given option
 */
export function getSortConfig(option: SortOption): SortConfig {
  return (
    SORT_OPTIONS.find((config) => config.option === option) || SORT_OPTIONS[0]
  );
}

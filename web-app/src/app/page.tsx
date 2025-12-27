import { coffeeDateService } from "@/features/coffee-dates/services";
import type { CoffeeDate } from "@/shared/types";
import { HomeContent } from "./home-content";

export const revalidate = 0; // Disable caching - always fetch fresh data

export default async function Home() {
  let coffeeDates: CoffeeDate[] = [];
  let error: string | null = null;

  try {
    coffeeDates = await coffeeDateService.getAll();
  } catch (err) {
    console.error("Failed to load coffee dates:", err);
    error = "Failed to load coffee dates";
  }

  return <HomeContent initialCoffeeDates={coffeeDates} initialError={error} />;
}

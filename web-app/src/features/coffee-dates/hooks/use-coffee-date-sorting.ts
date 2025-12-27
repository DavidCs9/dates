import { useMemo, useState } from "react";
import type { CoffeeDate } from "@/shared/types";
import { type SortOption, sortCoffeeDates } from "../utils/sorting";

interface UseCoffeeDateSortingProps {
  coffeeDates: CoffeeDate[];
  defaultSort?: SortOption;
}

export function useCoffeeDateSorting({
  coffeeDates,
  defaultSort = "visitDate-desc",
}: UseCoffeeDateSortingProps) {
  const [currentSort, setCurrentSort] = useState<SortOption>(defaultSort);

  const sortedCoffeeDates = useMemo(() => {
    return sortCoffeeDates(coffeeDates, currentSort);
  }, [coffeeDates, currentSort]);

  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort);
  };

  return {
    sortedCoffeeDates,
    currentSort,
    handleSortChange,
  };
}

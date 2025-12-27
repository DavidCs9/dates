import { SORT_OPTIONS, type SortOption } from "../utils/sorting";

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export function SortDropdown({
  currentSort,
  onSortChange,
  className,
}: SortDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.option} value={option.option}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

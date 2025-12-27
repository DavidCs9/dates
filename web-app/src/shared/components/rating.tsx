import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RatingProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
  className?: string;
}

export function Rating({
  label,
  value,
  onChange,
  readonly = false,
  max = 5,
  className,
}: RatingProps) {
  const handleRatingClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  if (readonly) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 flex-wrap",
          className,
        )}
      >
        <span className="text-xs sm:text-sm font-medium">{label}:</span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={`${label}-readonly-${i + 1}`}
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4",
                i < value
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200",
              )}
            />
          ))}
          <Badge
            variant="secondary"
            className="ml-1 text-[10px] sm:text-xs h-5 sm:h-auto px-1.5 sm:px-2"
          >
            {value}/{max}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <fieldset className={cn("flex flex-col gap-1.5 sm:gap-2", className)}>
      <legend className="text-xs sm:text-sm font-medium">{label}</legend>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: max }, (_, i) => (
          <Button
            key={`${label}-interactive-${i + 1}`}
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleRatingClick(i + 1)}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation",
              i < value ? "text-yellow-400" : "text-gray-300",
            )}
            aria-label={`Rate ${i + 1} out of ${max}`}
          >
            <Star
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                i < value ? "fill-current" : "fill-none",
              )}
            />
          </Button>
        ))}
        <Badge
          variant="outline"
          className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs h-5 sm:h-auto px-1.5 sm:px-2"
        >
          {value}/{max}
        </Badge>
      </div>
    </fieldset>
  );
}

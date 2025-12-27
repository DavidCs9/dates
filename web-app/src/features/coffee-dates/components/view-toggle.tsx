"use client";

import { Grid3X3, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "map";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({
  currentView,
  onViewChange,
  className,
}: ViewToggleProps) {
  return (
    <div className={cn("flex rounded-lg border bg-background p-1", className)}>
      <Button
        variant={currentView === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all",
          currentView === "grid"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={currentView === "map" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("map")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all",
          currentView === "map"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <MapIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Map</span>
      </Button>
    </div>
  );
}

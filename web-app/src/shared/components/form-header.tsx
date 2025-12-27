"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function FormHeader({
  title,
  onBack,
  showBackButton = true,
}: FormHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
        </div>
      </div>
    </div>
  );
}

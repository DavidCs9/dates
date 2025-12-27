"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus, useAuth } from "@/features/auth";
import {
  DeleteConfirmationDialog,
  MemoryCard,
  SortDropdown,
  type ViewMode,
  ViewToggle,
} from "@/features/coffee-dates/components";
import {
  useCoffeeDateManagement,
  useCoffeeDateSorting,
} from "@/features/coffee-dates/hooks";
import { coffeeDateClientService } from "@/features/coffee-dates/services";
import { MapView } from "@/features/locations/components";
import type { CoffeeDate } from "@/shared/types";

interface HomeContentProps {
  initialCoffeeDates: CoffeeDate[];
  initialError: string | null;
}

export function HomeContent({
  initialCoffeeDates,
  initialError,
}: HomeContentProps) {
  const [coffeeDates, setCoffeeDates] =
    useState<CoffeeDate[]>(initialCoffeeDates);
  const [error] = useState<string | null>(initialError);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coffeeDateToDelete, setCoffeeDateToDelete] =
    useState<CoffeeDate | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>("grid");

  const { isAuthenticated } = useAuth();
  const { handleEdit, handleDelete } = useCoffeeDateManagement();
  const { sortedCoffeeDates, currentSort, handleSortChange } =
    useCoffeeDateSorting({
      coffeeDates,
      defaultSort: "visitDate-desc",
    });

  const handleDeleteClick = (coffeeDateId: string) => {
    const coffeeDate = coffeeDates.find((cd) => cd.id === coffeeDateId);
    if (coffeeDate) {
      setCoffeeDateToDelete(coffeeDate);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async (coffeeDateId: string) => {
    await handleDelete(coffeeDateId);
    const updatedCoffeeDates = await coffeeDateClientService.getAll();
    setCoffeeDates(updatedCoffeeDates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Header with Authentication Status */}
        <header className="mb-6 sm:mb-8 lg:mb-12">
          {/* Header with title, new button, and auth button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                Cafecitos ☕
              </h1>
              <p className="text-xs sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                Lista de cafeterias de Ale y David
              </p>
            </div>

            {/* Action buttons in top right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && (
                <Button asChild size="sm" className="touch-manipulation">
                  <Link href="/create">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </Link>
                </Button>
              )}
              <AuthStatus variant="button" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-8 sm:py-12">
              <h2 className="text-xl sm:text-2xl font-bold text-destructive mb-3 sm:mb-4">
                Error
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {error}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="touch-manipulation"
              >
                Try Again
              </Button>
            </div>
          ) : coffeeDates.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  No hay dates :(
                </h2>
                {isAuthenticated ? (
                  <Button asChild size="lg" className="touch-manipulation">
                    <Link href="/create">
                      <Plus className="h-5 w-5" />
                      Añadir nuestro primer cafe
                    </Link>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Inicia sesión para añadir tu primer cafe.
                    </p>
                    <AuthStatus variant="button" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Sort Controls and View Toggle */}
              <div className="flex items-center justify-between mb-6 mx-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {sortedCoffeeDates.length} date
                    {sortedCoffeeDates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {currentView === "grid" && (
                    <SortDropdown
                      currentSort={currentSort}
                      onSortChange={handleSortChange}
                    />
                  )}
                  <ViewToggle
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
              </div>

              {/* Content based on view mode */}
              {currentView === "map" ? (
                <MapView coffeeDates={sortedCoffeeDates} className="w-full" />
              ) : (
                /* Coffee Dates Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                  {sortedCoffeeDates.map((coffeeDate, index) => (
                    <MemoryCard
                      key={coffeeDate.id}
                      coffeeDate={coffeeDate}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      isAuthenticated={isAuthenticated}
                      isPriority={index < 3}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          coffeeDate={coffeeDateToDelete}
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setCoffeeDateToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}

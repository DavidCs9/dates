"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus, useAuth } from "@/features/auth";
import {
  DeleteConfirmationDialog,
  MemoryCard,
} from "@/features/coffee-dates/components";
import { useCoffeeDateManagement } from "@/features/coffee-dates/hooks";
import { coffeeDateService } from "@/features/coffee-dates/services";
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

  const { isAuthenticated } = useAuth();
  const { handleEdit, handleDelete } = useCoffeeDateManagement();

  const handleDeleteClick = (coffeeDateId: string) => {
    const coffeeDate = coffeeDates.find((cd) => cd.id === coffeeDateId);
    if (coffeeDate) {
      setCoffeeDateToDelete(coffeeDate);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async (coffeeDateId: string) => {
    await handleDelete(coffeeDateId);
    const updatedCoffeeDates = await coffeeDateService.getAll();
    setCoffeeDates(updatedCoffeeDates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Authentication Status */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Coffee Date Chronicles
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your personal digital scrapbook for coffee adventures
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4" />
                  New Coffee Date
                </Link>
              </Button>
            )}
            <AuthStatus variant="full" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Error
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : coffeeDates.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  No Coffee Dates Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start documenting your coffee adventures! Create your first
                  coffee date memory.
                </p>
                {isAuthenticated ? (
                  <Button asChild size="lg">
                    <Link href="/create">
                      <Plus className="h-5 w-5" />
                      Create Your First Coffee Date
                    </Link>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sign in to create and manage your coffee date memories
                    </p>
                    <AuthStatus variant="button" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Coffee Dates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coffeeDates.map((coffeeDate) => (
                  <MemoryCard
                    key={coffeeDate.id}
                    coffeeDate={coffeeDate}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>

              {/* Add New Button for Authenticated Users */}
              {isAuthenticated && (
                <div className="flex justify-center mt-8">
                  <Button asChild size="lg">
                    <Link href="/create">
                      <Plus className="h-5 w-5" />
                      Add Another Coffee Date
                    </Link>
                  </Button>
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

'use client';

import { AuthStatus } from "@/features/auth";

export default function Home() {
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
          
          {/* Authentication Status Component */}
          <div className="flex items-center gap-4">
            <AuthStatus variant="full" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Your Coffee Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Document your special coffee dates with photos, ratings, and memories. 
              Create beautiful visual cards that capture every café visit and turn them into cherished memories.
            </p>
            
            {/* Authentication Demo Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Authentication Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Badge Style</h4>
                  <AuthStatus variant="badge" />
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Button Style</h4>
                  <AuthStatus variant="button" />
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Full Style</h4>
                  <AuthStatus variant="full" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📸 Photo Memories
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload multiple photos for each coffee date and create beautiful visual stories.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ⭐ Personal Ratings
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Rate your coffee and desserts on a personal scale to track your favorites.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📍 Location Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Remember every special place with Google Maps integration.
              </p>
            </div>
          </div>

          {/* Authentication Info */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔐 Simple Authentication
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Authentication is only required for creating, editing, or deleting coffee dates. 
              Anyone can view your coffee adventures without logging in.
            </p>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Write Operations (Require Auth):</strong> Create, Edit, Delete coffee dates<br/>
              <strong>Read Operations (Public):</strong> View coffee date memories
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

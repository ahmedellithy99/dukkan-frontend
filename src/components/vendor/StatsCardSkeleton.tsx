'use client';

/**
 * Loading skeleton for StatsCard component
 * Matches the layout and dimensions of the actual StatsCard
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          
          {/* Value skeleton */}
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
          
          {/* Trend skeleton */}
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        
        {/* Icon skeleton */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

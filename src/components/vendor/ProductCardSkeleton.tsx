'use client';

/**
 * Loading skeleton for Product Card component
 * Matches the layout and dimensions of the actual product card
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
      {/* Product Image Skeleton */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Product Info Skeleton */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        
        {/* Price and Discount */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
        </div>

        {/* Stock Info */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />

        {/* Quick Actions Buttons */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of product card skeletons
 * @param count - Number of skeleton cards to display (default: 8)
 */
export function ProductCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

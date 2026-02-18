'use client';

import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-blue-600',
}: StatsCardProps) {
  // Determine if trend is positive or negative
  const isPositiveTrend = trend && (trend.startsWith('+') || !trend.startsWith('-'));
  const trendColor = isPositiveTrend ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-xs sm:text-sm font-medium ${trendColor}`}>
              {trend}
            </p>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-opacity-10 ${color}`}
          style={{
            backgroundColor: `${color.replace('text-', '')}10`,
          }}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

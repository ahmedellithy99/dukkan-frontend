'use client';

import { Activity } from '@/types/marketplace';
import { Eye, MessageCircle, MapPin, Heart } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

// Map activity types to icons and colors
const getActivityIcon = (type: Activity['activity_type']) => {
  switch (type) {
    case 'view':
      return { icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'whatsapp_click':
      return { icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    case 'location_click':
      return { icon: MapPin, color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'favorite':
      return { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50' };
    default:
      return { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
};

// Get human-readable activity label
const getActivityLabel = (type: Activity['activity_type']) => {
  switch (type) {
    case 'view':
      return 'Product viewed';
    case 'whatsapp_click':
      return 'WhatsApp contact';
    case 'location_click':
      return 'Location viewed';
    case 'favorite':
      return 'Added to favorites';
    default:
      return 'Activity';
  }
};

// Loading skeleton component
const ActivitySkeleton = () => (
  <div className="flex items-start gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

export function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  // Show loading skeletons
  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No recent activity</p>
        <p className="text-xs text-gray-400 mt-1">
          Activity will appear here when customers interact with your products
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const { icon: Icon, color, bgColor } = getActivityIcon(activity.activity_type);
        const label = getActivityLabel(activity.activity_type);

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* Activity Icon */}
            <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>

            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.product.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.created_at_human}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * StatsCard Component Usage Examples
 * 
 * This file demonstrates how to use the StatsCard component
 * in the vendor dashboard.
 */

import { StatsCard } from './StatsCard';
import { Package, Eye, MessageCircle, MapPin, TrendingUp, Heart } from 'lucide-react';

export function StatsCardExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Total Products */}
      <StatsCard
        title="Total Products"
        value={101}
        icon={Package}
        trend="+5 this week"
        color="text-blue-600"
      />

      {/* Active Products */}
      <StatsCard
        title="Active Products"
        value={92}
        icon={Package}
        trend="+3 this week"
        color="text-green-600"
      />

      {/* Total Views */}
      <StatsCard
        title="Total Views"
        value={23805}
        icon={Eye}
        trend="+12% this week"
        color="text-purple-600"
      />

      {/* WhatsApp Clicks */}
      <StatsCard
        title="WhatsApp Clicks"
        value={2298}
        icon={MessageCircle}
        trend="+8% this week"
        color="text-green-600"
      />

      {/* Location Clicks */}
      <StatsCard
        title="Location Clicks"
        value={4}
        icon={MapPin}
        trend="-2% this week"
        color="text-blue-600"
      />

      {/* Engagement Rate */}
      <StatsCard
        title="Engagement Rate"
        value="29.04%"
        icon={TrendingUp}
        trend="+4.2% this week"
        color="text-orange-600"
      />

      {/* Favorites */}
      <StatsCard
        title="Total Favorites"
        value={4610}
        icon={Heart}
        trend="+15% this week"
        color="text-red-600"
      />

      {/* Without trend */}
      <StatsCard
        title="Inactive Products"
        value={9}
        icon={Package}
        color="text-gray-600"
      />
    </div>
  );
}

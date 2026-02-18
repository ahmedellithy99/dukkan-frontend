'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  MapPin,
  Plus,
  Settings,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import type { DashboardStats, Activity } from '@/types/marketplace';

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('vendor_token');
        if (!token) {
          setError('No authentication token found. Please login.');
          setLoading(false);
          return;
        }

        // Fetch dashboard stats and recent activity
        const [statsResponse, activityResponse] = await Promise.all([
          vendorApi.getDashboardStats(token),
          vendorApi.getRecentActivity(token, 7)
        ]);

        setStats(statsResponse.data);
        setActivities(activityResponse.data.activities);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'view':
        return { Icon: Eye, color: 'bg-green-100 dark:bg-green-900/20 text-green-600' };
      case 'whatsapp_click':
        return { Icon: MessageCircle, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' };
      case 'location_click':
        return { Icon: MapPin, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600' };
      case 'favorite':
        return { Icon: TrendingUp, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' };
      default:
        return { Icon: Eye, color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600' };
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'view':
        return `Product "${activity.product.name}" viewed`;
      case 'whatsapp_click':
        return `WhatsApp contact for "${activity.product.name}"`;
      case 'location_click':
        return `Location viewed for "${activity.product.name}"`;
      case 'favorite':
        return `Product "${activity.product.name}" favorited`;
      default:
        return `Activity on "${activity.product.name}"`;
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Error Loading Dashboard</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                Retry
              </Button>
              <Link href="/vendor/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your shop and products</p>
            </div>
            <div className="flex gap-2">
              <Link href="/vendor/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/vendor/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                    <p className="text-3xl font-bold">{stats.total_products}</p>
                  </div>
                  <div className="p-3 rounded-full bg-muted text-blue-600">
                    <Package className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Products</p>
                    <p className="text-3xl font-bold">{stats.active_products}</p>
                  </div>
                  <div className="p-3 rounded-full bg-muted text-green-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                    <p className="text-3xl font-bold">{stats.total_views.toLocaleString()}</p>
                    {stats.trends.views_change !== 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        +{stats.trends.views_change}% this week
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-full bg-muted text-purple-600">
                    <Eye className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">WhatsApp Clicks</p>
                    <p className="text-3xl font-bold">{stats.total_whatsapp_clicks}</p>
                    {stats.trends.whatsapp_change !== 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        +{stats.trends.whatsapp_change}% this week
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-full bg-muted text-green-600">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location Clicks</p>
                    <p className="text-3xl font-bold">{stats.total_location_clicks}</p>
                    {stats.trends.location_change !== 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        +{stats.trends.location_change}% this week
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-full bg-muted text-blue-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                    <p className="text-3xl font-bold">{stats.engagement_rate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-full bg-muted text-orange-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/vendor/products">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span>Manage Products</span>
                  </Button>
                </Link>
                <Link href="/vendor/products/new">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Plus className="h-6 w-6" />
                    <span>Add New Product</span>
                  </Button>
                </Link>
                <Link href="/vendor/analytics">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>View Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const { Icon, color } = getActivityIcon(activity.activity_type);
                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className={`p-2 rounded-full ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getActivityText(activity)}</p>
                          <p className="text-sm text-muted-foreground">{activity.created_at_human}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    whatsappClicks: 0,
    locationClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch vendor stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalProducts: 24,
        activeProducts: 20,
        totalViews: 1250,
        whatsappClicks: 340,
        locationClicks: 180,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'text-primary' 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
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
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              color="text-blue-600"
            />
            <StatCard
              title="Active Products"
              value={stats.activeProducts}
              icon={ShoppingBag}
              color="text-green-600"
            />
            <StatCard
              title="Total Views"
              value={stats.totalViews.toLocaleString()}
              icon={Eye}
              trend="+12% this week"
              color="text-purple-600"
            />
            <StatCard
              title="WhatsApp Clicks"
              value={stats.whatsappClicks}
              icon={MessageCircle}
              trend="+8% this week"
              color="text-green-600"
            />
            <StatCard
              title="Location Clicks"
              value={stats.locationClicks}
              icon={MapPin}
              trend="+5% this week"
              color="text-blue-600"
            />
            <StatCard
              title="Engagement Rate"
              value="41.6%"
              icon={TrendingUp}
              trend="+3.2% this week"
              color="text-orange-600"
            />
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
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Product "Samsung Galaxy S21" viewed</p>
                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">WhatsApp contact for "iPhone 13 Pro"</p>
                    <p className="text-sm text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Location viewed for your shop</p>
                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

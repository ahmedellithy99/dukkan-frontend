/**
 * ActivityFeed Component - Usage Examples
 * 
 * This file demonstrates how to use the ActivityFeed component
 * in the vendor dashboard.
 */

import { ActivityFeed } from './ActivityFeed';
import { Activity } from '@/types/marketplace';

// Example 1: With real activity data
const exampleActivities: Activity[] = [
  {
    id: 1,
    activity_type: 'view',
    created_at: '2026-02-18T10:30:00.000000Z',
    created_at_human: '2 minutes ago',
    product: {
      id: 5,
      name: 'Samsung Galaxy S21',
      slug: 'samsung-galaxy-s21'
    }
  },
  {
    id: 2,
    activity_type: 'whatsapp_click',
    created_at: '2026-02-18T10:25:00.000000Z',
    created_at_human: '7 minutes ago',
    product: {
      id: 12,
      name: 'iPhone 13 Pro',
      slug: 'iphone-13-pro'
    }
  },
  {
    id: 3,
    activity_type: 'location_click',
    created_at: '2026-02-18T10:20:00.000000Z',
    created_at_human: '12 minutes ago',
    product: {
      id: 8,
      name: 'MacBook Pro M2',
      slug: 'macbook-pro-m2'
    }
  },
  {
    id: 4,
    activity_type: 'favorite',
    created_at: '2026-02-18T10:15:00.000000Z',
    created_at_human: '17 minutes ago',
    product: {
      id: 3,
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5'
    }
  }
];

// Example 2: Usage in Dashboard Page
export function DashboardExample() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <ActivityFeed activities={exampleActivities} />
    </div>
  );
}

// Example 3: Loading State
export function LoadingExample() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <ActivityFeed activities={[]} loading={true} />
    </div>
  );
}

// Example 4: Empty State
export function EmptyExample() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <ActivityFeed activities={[]} loading={false} />
    </div>
  );
}

// Example 5: Integration with API
export function ApiIntegrationExample() {
  // This would be in your actual dashboard page
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;

        const response = await vendorApi.getRecentActivity(token, 7);
        setActivities(response.data.activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <ActivityFeed activities={activities} loading={loading} />
    </div>
  );
}

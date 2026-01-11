import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import PageViewsChart from '@/components/admin/charts/PageViewsChart';
import BrowserPieChart from '@/components/admin/charts/BrowserPieChart';
import AiUsageChart from '@/components/admin/charts/AiUsageChart';
import TrafficChart from '@/components/admin/charts/TrafficChart';
import { mockStats } from '@/data/mockData';
import { Users, Eye, MessageSquare, Clock, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your system overview.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          change="+12.5% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Users"
          value={mockStats.activeUsers}
          change="Currently online"
          changeType="neutral"
          icon={Activity}
        />
        <StatCard
          title="Page Views"
          value={mockStats.totalPageViews}
          change="+8.2% from last week"
          changeType="positive"
          icon={Eye}
        />
        <StatCard
          title="AI Queries"
          value={mockStats.aiQueries}
          change="+23.1% from last month"
          changeType="positive"
          icon={MessageSquare}
        />
        <StatCard
          title="Avg. Session"
          value={mockStats.avgSessionDuration}
          change="+0.5m from last week"
          changeType="positive"
          icon={Clock}
        />
        <StatCard
          title="Bounce Rate"
          value={`${mockStats.bounceRate}%`}
          change="-2.3% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Traffic Chart */}
      <div className="mb-6">
        <TrafficChart />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <PageViewsChart />
        <BrowserPieChart />
        <AiUsageChart />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

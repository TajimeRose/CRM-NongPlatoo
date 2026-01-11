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
    <AdminLayout title="แดชบอร์ด" subtitle="ยินดีต้อนรับ! ภาพรวมระบบน้องปลาทู - ผู้ช่วยประชาสัมพันธ์การท่องเที่ยวสมุทรสงคราม">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="ผู้ใช้ทั้งหมด"
          value={mockStats.totalUsers}
          change="+12.5% จากเดือนที่แล้ว"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="ผู้ใช้ออนไลน์"
          value={mockStats.activeUsers}
          change="กำลังใช้งานอยู่"
          changeType="neutral"
          icon={Activity}
        />
        <StatCard
          title="จำนวนเข้าชม"
          value={mockStats.totalPageViews}
          change="+8.2% จากสัปดาห์ที่แล้ว"
          changeType="positive"
          icon={Eye}
        />
        <StatCard
          title="คำถาม AI"
          value={mockStats.aiQueries}
          change="+23.1% จากเดือนที่แล้ว"
          changeType="positive"
          icon={MessageSquare}
        />
        <StatCard
          title="ระยะเวลาเฉลี่ย"
          value={mockStats.avgSessionDuration}
          change="+0.5 นาทีจากสัปดาห์ที่แล้ว"
          changeType="positive"
          icon={Clock}
        />
        <StatCard
          title="Bounce Rate"
          value={`${mockStats.bounceRate}%`}
          change="-2.3% จากเดือนที่แล้ว"
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

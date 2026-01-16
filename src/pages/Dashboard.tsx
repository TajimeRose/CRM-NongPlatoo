import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import PageViewsChart from '@/components/admin/charts/PageViewsChart';
import BrowserPieChart from '@/components/admin/charts/BrowserPieChart';
import AiUsageChart from '@/components/admin/charts/AiUsageChart';
import TrafficChart from '@/components/admin/charts/TrafficChart';
import { useStats } from '@/hooks/useApi';
import { Users, Eye, MessageSquare, Clock, TrendingUp, Activity, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useStats();
  const [usersCount, setUsersCount] = useState({ total: 0, online: 0 });

  // Fetch total users and online users count
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/users-count`);
        if (response.ok) {
          const data = await response.json();
          setUsersCount(data);
        }
      } catch (error) {
        console.error('Error fetching users count:', error);
      }
    };

    fetchUsersCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use API data if available
  const displayStats = stats || { totalPageViews: 0, aiQueries: 0, avgSessionDuration: '0m', bounceRate: 0 };

  return (
    <AdminLayout title="แดชบอร์ด" subtitle="ยินดีต้อนรับ! ภาพรวมระบบน้องปลาทู - ผู้ช่วยประชาสัมพันธ์การท่องเที่ยวสมุทรสงคราม">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg">
          ไม่สามารถโหลดข้อมูลจาก API ได้ - กำลังแสดงข้อมูลตัวอย่าง
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="ผู้ใช้ทั้งหมด"
          value={usersCount.total}
          change="จาก Firebase Auth"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="ผู้ใช้ออนไลน์"
          value={usersCount.online}
          change="กำลังใช้งานอยู่"
          changeType={usersCount.online > 0 ? "positive" : "neutral"}
          icon={Activity}
        />
        <StatCard
          title="จำนวนเข้าชม"
          value={displayStats.totalPageViews}
          change="+8.2% จากสัปดาห์ที่แล้ว"
          changeType="positive"
          icon={Eye}
        />
        <StatCard
          title="คำถาม AI"
          value={displayStats.aiQueries}
          change="+23.1% จากเดือนที่แล้ว"
          changeType="positive"
          icon={MessageSquare}
        />
        <StatCard
          title="ระยะเวลาเฉลี่ย"
          value={displayStats.avgSessionDuration}
          change="+0.5 นาทีจากสัปดาห์ที่แล้ว"
          changeType="positive"
          icon={Clock}
        />
        <StatCard
          title="Bounce Rate"
          value={`${displayStats.bounceRate}%`}
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

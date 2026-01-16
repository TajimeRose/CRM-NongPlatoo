import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePageViews } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

// แปลง URL เป็นชื่อหน้าภาษาไทย
const pageNamesThai: Record<string, string> = {
  '/': 'หน้าแรก',
  'places': 'สถานที่ท่องเที่ยว',
  'chat': 'แชท AI',
  'search': 'ค้นหา',
  'profile': 'โปรไฟล์',
  'settings': 'ตั้งค่า',
  'about': 'เกี่ยวกับ',
  'contact': 'ติดต่อ'
};

const formatPageName = (url: string): string => {
  if (!url) return 'หน้าแรก';
  const cleanUrl = url.replace(/^\//, '');
  if (!cleanUrl) return 'หน้าแรก';
  if (pageNamesThai[cleanUrl]) return pageNamesThai[cleanUrl];
  if (cleanUrl.startsWith('places/')) {
    const id = cleanUrl.replace('places/', '');
    return `สถานที่ #${id}`;
  }
  return cleanUrl;
};

// Tooltip แสดงทั้งชื่อไทยและ URL
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="text-foreground font-medium">{data.page}</p>
        <p className="text-primary text-lg font-bold">{data.views.toLocaleString()} ครั้ง</p>
        <p className="text-muted-foreground text-xs mt-1 font-mono">{data.url}</p>
      </div>
    );
  }
  return null;
};

const PageViewsChart = () => {
  const { data: apiData, isLoading, error } = usePageViews();

  // ถ้าไม่มีข้อมูล หรือ error ให้แสดง empty state
  const chartData = (() => {
    if (!apiData?.length) {
      return [{ page: 'ไม่มีข้อมูล', views: 0, url: '-' }];
    }
    return apiData.map(item => ({
      page: formatPageName(item.page),
      views: parseInt(String(item.views)) || 0,
      url: item.page || '/'
    })).slice(0, 7);
  })();

  return (
    <div className="glass-card p-6 h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">จำนวนการเข้าชมหน้า</h3>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {error && (
        <div className="text-xs text-muted-foreground mb-2">⚠️ ไม่สามารถเชื่อมต่อ API</div>
      )}
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            type="category"
            dataKey="page"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
          <Bar
            dataKey="views"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PageViewsChart;

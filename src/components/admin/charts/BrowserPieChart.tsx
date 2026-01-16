import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBrowserStats } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

// สีที่ชัดเจนและแตกต่างกัน
const BROWSER_COLORS: Record<string, string> = {
  'Chrome': '#4285F4',           // Google Blue
  'Safari': '#0FB5EE',           // Safari Blue
  'Firefox': '#FF7139',          // Firefox Orange
  'LINE': '#00B900',             // LINE Green
  'Facebook App': '#1877F2',     // Facebook Blue
  'Instagram': '#E4405F',        // Instagram Pink
  'TikTok': '#000000',           // TikTok Black
  'Twitter/X': '#1DA1F2',        // Twitter Blue
  'Samsung Internet': '#1428A0', // Samsung Purple
  'Microsoft Edge': '#0078D7',   // Edge Blue
  'Opera': '#FF1B2D',            // Opera Red
  'UC Browser': '#FF6600',       // UC Orange
  'WebView (App)': '#9B59B6',    // Purple
  'Brave': '#FB542B',            // Brave Orange
  'Xiaomi Browser': '#FF6900',   // Xiaomi Orange
  'Huawei Browser': '#C7000B',   // Huawei Red
  'Bots': '#95A5A6',             // Gray
  'Snapchat': '#FFFC00',         // Snapchat Yellow
  'Pinterest': '#E60023',        // Pinterest Red
  'อื่นๆ': '#7F8C8D'             // Gray for unknown
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-foreground font-medium">{payload[0].name}</p>
        <p className="text-primary">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const BrowserPieChart = () => {
  const { data: apiData, isLoading, error } = useBrowserStats();

  // ถ้าไม่มีข้อมูล หรือ API error ให้แสดง empty state แทน mock data
  const chartData = (() => {
    if (!apiData?.length) {
      return [{ name: 'ไม่มีข้อมูล', value: 100, fill: '#7F8C8D' }];
    }
    const total = apiData.reduce((sum, item) => sum + (item.value || 0), 0);
    if (total === 0) {
      return [{ name: 'ไม่มีข้อมูล', value: 100, fill: '#7F8C8D' }];
    }
    return apiData.map(item => ({
      name: item.name,
      value: total > 0 ? Math.round((item.value / total) * 100) : 0,
      fill: BROWSER_COLORS[item.name] || '#7F8C8D'
    }));
  })();

  return (
    <div className="glass-card p-6 h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">เบราว์เซอร์ที่ใช้เข้าชม</h3>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {error && (
        <div className="text-xs text-muted-foreground mb-2">⚠️ ไม่สามารถเชื่อมต่อ API</div>
      )}
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrowserPieChart;

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TrafficData {
  date: string;
  visitors: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-primary">{payload[0].value.toLocaleString()} คนเข้าใช้งาน</p>
      </div>
    );
  }
  return null;
};

// Generate dynamic mock data based on current date
const generateDailyMockData = (): TrafficData[] => {
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const today = new Date();
  const result: TrafficData[] = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    // Random visitors between 80-200 for demo
    const visitors = Math.floor(Math.random() * 120) + 80;
    result.push({ date: `${day} ${month}`, visitors });
  }
  return result;
};

const TrafficChart = () => {
  const [data, setData] = useState<TrafficData[]>(generateDailyMockData());
  const [isLoading, setIsLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/daily-traffic`);
        if (response.ok) {
          const result = await response.json();
          if (result.length > 0) {
            // Parse visitors to number and format data
            const formattedData = result.map((item: any) => ({
              date: item.date,
              visitors: parseInt(item.visitors) || 0
            }));
            setData(formattedData);
            setIsRealData(true);
          } else {
            setData(generateDailyMockData());
            setIsRealData(false);
          }
        }
      } catch (error) {
        console.error('Error fetching daily traffic data:', error);
        setData(generateDailyMockData());
        setIsRealData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="glass-card p-6 h-[300px]">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        จำนวนผู้เข้าใช้งานรายวัน
        {isLoading && <span className="text-sm text-muted-foreground ml-2">(กำลังโหลด...)</span>}
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#trafficGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;

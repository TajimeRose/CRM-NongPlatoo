import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAiUsageData } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

// แปลงวันภาษาอังกฤษเป็นภาษาไทย
const dayNamesThai: Record<string, string> = {
  'Mon': 'จันทร์',
  'Tue': 'อังคาร',
  'Wed': 'พุธ',
  'Thu': 'พฤหัส',
  'Fri': 'ศุกร์',
  'Sat': 'เสาร์',
  'Sun': 'อาทิตย์'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AiUsageChart = () => {
  const { data: apiData, isLoading, error } = useAiUsageData();

  // ถ้าไม่มีข้อมูล หรือ error ให้แสดง empty data แทน mock data
  const chartData = (() => {
    if (!apiData?.length) {
      // แสดงกราฟว่าง 7 วัน
      return ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map(day => ({
        date: day,
        queries: 0,
        tokens: 0
      }));
    }
    return apiData.map(item => ({
      date: dayNamesThai[item.date] || item.date,
      queries: parseInt(String(item.queries)) || 0,
      tokens: parseInt(String(item.tokens)) || 0
    }));
  })();

  return (
    <div className="glass-card p-6 h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">แนวโน้มการใช้งาน AI น้องปลาทู</h3>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {error && (
        <div className="text-xs text-muted-foreground mb-2">⚠️ ไม่สามารถเชื่อมต่อ API</div>
      )}
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="queries"
            name="คำถาม"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
          <Line
            type="monotone"
            dataKey="tokens"
            name="Tokens"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AiUsageChart;

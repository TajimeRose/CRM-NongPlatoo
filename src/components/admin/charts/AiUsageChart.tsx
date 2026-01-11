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
import { mockAiUsageData } from '@/data/mockData';

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
  return (
    <div className="glass-card p-6 h-[400px]">
      <h3 className="text-lg font-semibold text-foreground mb-4">แนวโน้มการใช้งาน AI น้องปลาทู</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={mockAiUsageData}>
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

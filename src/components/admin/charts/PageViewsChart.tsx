import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockPageViews } from '@/data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-primary">{payload[0].value.toLocaleString()} views</p>
      </div>
    );
  }
  return null;
};

const PageViewsChart = () => {
  return (
    <div className="glass-card p-6 h-[400px]">
      <h3 className="text-lg font-semibold text-foreground mb-4">Page Views</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={mockPageViews} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            type="category"
            dataKey="page"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={100}
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

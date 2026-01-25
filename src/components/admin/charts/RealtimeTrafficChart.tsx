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

interface RealtimeData {
    hour: string;
    users: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="text-foreground font-medium">{label}</p>
                <p className="text-primary">{payload[0].value} ผู้ใช้งานออนไลน์</p>
            </div>
        );
    }
    return null;
};

// Generate realistic mock data up to current hour only
const generateMockDataUpToNow = (): RealtimeData[] => {
    const currentHour = new Date().getHours();
    const baseData = [
        { hour: '00:00', users: 45 },
        { hour: '02:00', users: 28 },
        { hour: '04:00', users: 15 },
        { hour: '06:00', users: 52 },
        { hour: '08:00', users: 145 },
        { hour: '10:00', users: 280 },
        { hour: '12:00', users: 320 },
        { hour: '14:00', users: 295 },
        { hour: '16:00', users: 350 },
        { hour: '18:00', users: 420 },
        { hour: '20:00', users: 285 },
        { hour: '22:00', users: 150 },
    ];

    // Filter to only show hours up to current hour
    return baseData.filter(item => {
        const hourNum = parseInt(item.hour.split(':')[0]);
        return hourNum <= currentHour;
    });
};

const RealtimeTrafficChart = () => {
    const [data, setData] = useState<RealtimeData[]>(generateMockDataUpToNow());
    const [isLoading, setIsLoading] = useState(true);
    const [isRealData, setIsRealData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/stats/traffic`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.length > 0) {
                        // Use real data from API
                        const formattedData = result.map((item: any) => ({
                            hour: item.hour,
                            users: parseInt(item.users) || 0
                        }));
                        setData(formattedData);
                        setIsRealData(true);
                    } else {
                        // Use mock data if no real data
                        setData(generateMockDataUpToNow());
                        setIsRealData(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching realtime traffic data:', error);
                setData(generateMockDataUpToNow());
                setIsRealData(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // Refresh every 5 minutes for realtime data
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card p-6 h-[300px]">
            <h3 className="text-lg font-semibold text-foreground mb-4">
                สถิติผู้เข้าชมแบบเรียลไทม์ (24 ชม.)
                {isLoading && <span className="text-sm text-muted-foreground ml-2">(กำลังโหลด...)</span>}
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="realtimeTrafficGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="users"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        fill="url(#realtimeTrafficGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RealtimeTrafficChart;

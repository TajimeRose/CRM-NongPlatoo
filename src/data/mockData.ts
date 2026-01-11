// Mock data for the admin dashboard

export const mockStats = {
  totalUsers: 12847,
  activeUsers: 3429,
  totalPageViews: 287543,
  aiQueries: 45821,
  avgSessionDuration: '4m 32s',
  bounceRate: 32.4,
};

export const mockPageViews = [
  { page: '/home', views: 45230 },
  { page: '/places', views: 32140 },
  { page: '/search', views: 28450 },
  { page: '/place/detail', views: 24890 },
  { page: '/profile', views: 18320 },
  { page: '/chat', views: 15670 },
  { page: '/settings', views: 8940 },
];

export const mockBrowserStats = [
  { name: 'Chrome', value: 58, fill: 'hsl(var(--chart-1))' },
  { name: 'Safari', value: 22, fill: 'hsl(var(--chart-2))' },
  { name: 'Firefox', value: 12, fill: 'hsl(var(--chart-3))' },
  { name: 'Edge', value: 6, fill: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 2, fill: 'hsl(var(--chart-5))' },
];

export const mockOsStats = [
  { name: 'Windows', value: 42 },
  { name: 'macOS', value: 28 },
  { name: 'iOS', value: 18 },
  { name: 'Android', value: 10 },
  { name: 'Linux', value: 2 },
];

export const mockAiUsageData = [
  { date: 'Mon', queries: 1200, tokens: 45000 },
  { date: 'Tue', queries: 1850, tokens: 68000 },
  { date: 'Wed', queries: 2100, tokens: 78000 },
  { date: 'Thu', queries: 1950, tokens: 72000 },
  { date: 'Fri', queries: 2400, tokens: 89000 },
  { date: 'Sat', queries: 1600, tokens: 58000 },
  { date: 'Sun', queries: 1100, tokens: 42000 },
];

export const mockUsers = [
  { id: 1, email: 'john.doe@example.com', name: 'John Doe', role: 'user', status: 'active', lastLogin: '2024-01-10 14:32', createdAt: '2023-06-15' },
  { id: 2, email: 'jane.smith@example.com', name: 'Jane Smith', role: 'admin', status: 'active', lastLogin: '2024-01-11 09:15', createdAt: '2023-04-22' },
  { id: 3, email: 'bob.wilson@example.com', name: 'Bob Wilson', role: 'user', status: 'banned', lastLogin: '2024-01-05 18:45', createdAt: '2023-08-10' },
  { id: 4, email: 'alice.brown@example.com', name: 'Alice Brown', role: 'moderator', status: 'active', lastLogin: '2024-01-11 11:20', createdAt: '2023-05-30' },
  { id: 5, email: 'charlie.davis@example.com', name: 'Charlie Davis', role: 'user', status: 'inactive', lastLogin: '2023-12-20 16:00', createdAt: '2023-09-01' },
];

export const mockPlaces = [
  { id: 1, name: 'Central Park Restaurant', category: 'Restaurant', isPromoted: true, promotedScore: 95, promotionExpiry: '2024-02-15', views: 12450 },
  { id: 2, name: 'Downtown Coffee House', category: 'Cafe', isPromoted: true, promotedScore: 85, promotionExpiry: '2024-01-25', views: 8920 },
  { id: 3, name: 'Beachside Resort', category: 'Hotel', isPromoted: false, promotedScore: 0, promotionExpiry: null, views: 6780 },
  { id: 4, name: 'Mountain Trail Tours', category: 'Activity', isPromoted: true, promotedScore: 70, promotionExpiry: '2024-03-01', views: 5430 },
  { id: 5, name: 'City Art Gallery', category: 'Attraction', isPromoted: false, promotedScore: 0, promotionExpiry: null, views: 4120 },
];

export const mockSystemConfigs = [
  { id: 1, key: 'ai_model', value: 'gpt-4-turbo', description: 'AI model for chat responses', category: 'AI' },
  { id: 2, key: 'ai_max_tokens', value: '2048', description: 'Maximum tokens per AI response', category: 'AI' },
  { id: 3, key: 'ai_temperature', value: '0.7', description: 'AI response creativity (0-1)', category: 'AI' },
  { id: 4, key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', category: 'System' },
  { id: 5, key: 'rate_limit_requests', value: '100', description: 'API rate limit per minute', category: 'Security' },
  { id: 6, key: 'session_timeout', value: '3600', description: 'Session timeout in seconds', category: 'Security' },
];

export const mockSecurityLogs = [
  { id: 1, ip: '192.168.1.100', action: 'Failed Login Attempt', count: 15, timestamp: '2024-01-11 08:45:32', severity: 'high', blocked: true },
  { id: 2, ip: '10.0.0.55', action: 'Rate Limit Exceeded', count: 234, timestamp: '2024-01-11 09:12:18', severity: 'medium', blocked: false },
  { id: 3, ip: '172.16.0.42', action: 'SQL Injection Attempt', count: 3, timestamp: '2024-01-11 07:30:45', severity: 'critical', blocked: true },
  { id: 4, ip: '192.168.2.200', action: 'Suspicious Scraping', count: 450, timestamp: '2024-01-10 22:15:00', severity: 'medium', blocked: true },
  { id: 5, ip: '10.10.10.10', action: 'XSS Attempt', count: 8, timestamp: '2024-01-10 18:45:22', severity: 'high', blocked: true },
];

export const mockChatHistories = [
  { id: 1, userId: 1, userName: 'John Doe', messages: [
    { role: 'user', content: 'What are the best restaurants nearby?', timestamp: '2024-01-11 14:30:00' },
    { role: 'assistant', content: 'Based on your location, I recommend Central Park Restaurant which is highly rated for Italian cuisine...', timestamp: '2024-01-11 14:30:05' },
  ], tokensUsed: 245, createdAt: '2024-01-11 14:30:00' },
  { id: 2, userId: 4, userName: 'Alice Brown', messages: [
    { role: 'user', content: 'Find me a hotel with a pool', timestamp: '2024-01-11 10:15:00' },
    { role: 'assistant', content: 'I found several hotels with pools in your area. The top recommendation is Beachside Resort...', timestamp: '2024-01-11 10:15:08' },
  ], tokensUsed: 312, createdAt: '2024-01-11 10:15:00' },
  { id: 3, userId: 2, userName: 'Jane Smith', messages: [
    { role: 'user', content: 'What hiking trails are available?', timestamp: '2024-01-10 16:45:00' },
    { role: 'assistant', content: 'There are several hiking trails near you. Mountain Trail Tours offers guided tours...', timestamp: '2024-01-10 16:45:12' },
  ], tokensUsed: 189, createdAt: '2024-01-10 16:45:00' },
];

export const mockTrafficData = [
  { hour: '00:00', users: 120 },
  { hour: '02:00', users: 45 },
  { hour: '04:00', users: 28 },
  { hour: '06:00', users: 85 },
  { hour: '08:00', users: 245 },
  { hour: '10:00', users: 380 },
  { hour: '12:00', users: 420 },
  { hour: '14:00', users: 395 },
  { hour: '16:00', users: 450 },
  { hour: '18:00', users: 520 },
  { hour: '20:00', users: 385 },
  { hour: '22:00', users: 210 },
];

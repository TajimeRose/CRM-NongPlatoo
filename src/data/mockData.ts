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
  { page: 'หน้าแรก', views: 45230 },
  { page: 'สถานที่ท่องเที่ยว', views: 32140 },
  { page: 'ค้นหา', views: 28450 },
  { page: 'รายละเอียดสถานที่', views: 24890 },
  { page: 'โปรไฟล์', views: 18320 },
  { page: 'แชท AI', views: 15670 },
  { page: 'ตั้งค่า', views: 8940 },
];

export const mockBrowserStats = [
  { name: 'Chrome', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Safari', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'LINE Browser', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Facebook', value: 10, fill: 'hsl(var(--chart-4))' },
  { name: 'อื่นๆ', value: 5, fill: 'hsl(var(--chart-5))' },
];

export const mockOsStats = [
  { name: 'Windows', value: 42 },
  { name: 'macOS', value: 28 },
  { name: 'iOS', value: 18 },
  { name: 'Android', value: 10 },
  { name: 'Linux', value: 2 },
];

export const mockAiUsageData = [
  { date: 'จันทร์', queries: 1200, tokens: 45000 },
  { date: 'อังคาร', queries: 1850, tokens: 68000 },
  { date: 'พุธ', queries: 2100, tokens: 78000 },
  { date: 'พฤหัส', queries: 1950, tokens: 72000 },
  { date: 'ศุกร์', queries: 2400, tokens: 89000 },
  { date: 'เสาร์', queries: 1600, tokens: 58000 },
  { date: 'อาทิตย์', queries: 1100, tokens: 42000 },
];

export const mockUsers = [
  { id: 1, email: 'somchai@gmail.com', name: 'สมชาย ใจดี', role: 'user', status: 'active', lastLogin: '2024-01-10 14:32', createdAt: '2023-06-15' },
  { id: 2, email: 'admin@nongplatoo.online', name: 'Admin น้องปลาทู', role: 'admin', status: 'active', lastLogin: '2024-01-11 09:15', createdAt: '2023-04-22' },
  { id: 3, email: 'somsri@hotmail.com', name: 'สมศรี มะลิวัลย์', role: 'user', status: 'banned', lastLogin: '2024-01-05 18:45', createdAt: '2023-08-10' },
  { id: 4, email: 'mod@nongplatoo.online', name: 'ผู้ดูแลระบบ', role: 'moderator', status: 'active', lastLogin: '2024-01-11 11:20', createdAt: '2023-05-30' },
  { id: 5, email: 'visitor@gmail.com', name: 'นักท่องเที่ยว', role: 'user', status: 'inactive', lastLogin: '2023-12-20 16:00', createdAt: '2023-09-01' },
];

export const mockPlaces = [
  { id: 1, name: 'ตลาดน้ำอัมพวา', category: 'ตลาดน้ำ', isPromoted: true, promotedScore: 95, promotionExpiry: '2024-02-15', views: 12450 },
  { id: 2, name: 'ตลาดร่มหุบ', category: 'ตลาด', isPromoted: true, promotedScore: 85, promotionExpiry: '2024-01-25', views: 8920 },
  { id: 3, name: 'วัดบางกุ้ง (โบสถ์ปรกโพธิ์)', category: 'วัด', isPromoted: false, promotedScore: 0, promotionExpiry: null, views: 6780 },
  { id: 4, name: 'สวนมะพร้าวริมคลอง', category: 'โฮมสเตย์', isPromoted: true, promotedScore: 70, promotionExpiry: '2024-03-01', views: 5430 },
  { id: 5, name: 'วัดจุฬามณี', category: 'วัด', isPromoted: false, promotedScore: 0, promotionExpiry: null, views: 4120 },
];

export const mockSystemConfigs = [
  { id: 1, key: 'ai_model', value: 'gpt-4-turbo', description: 'โมเดล AI สำหรับน้องปลาทู', category: 'AI' },
  { id: 2, key: 'ai_max_tokens', value: '2048', description: 'จำนวน Token สูงสุดต่อการตอบ', category: 'AI' },
  { id: 3, key: 'ai_temperature', value: '0.7', description: 'ความสร้างสรรค์ของ AI (0-1)', category: 'AI' },
  { id: 4, key: 'maintenance_mode', value: 'false', description: 'เปิดโหมดปิดปรับปรุง', category: 'ระบบ' },
  { id: 5, key: 'rate_limit_requests', value: '100', description: 'จำกัด API ต่อนาที', category: 'ความปลอดภัย' },
  { id: 6, key: 'session_timeout', value: '3600', description: 'หมดเวลา Session (วินาที)', category: 'ความปลอดภัย' },
];

export const mockSecurityLogs = [
  { id: 1, ip: '192.168.1.100', action: 'พยายามเข้าสู่ระบบล้มเหลว', count: 15, timestamp: '2024-01-11 08:45:32', severity: 'high', blocked: true },
  { id: 2, ip: '10.0.0.55', action: 'เกินขีดจำกัด Rate Limit', count: 234, timestamp: '2024-01-11 09:12:18', severity: 'medium', blocked: false },
  { id: 3, ip: '172.16.0.42', action: 'พยายามโจมตี SQL Injection', count: 3, timestamp: '2024-01-11 07:30:45', severity: 'critical', blocked: true },
  { id: 4, ip: '192.168.2.200', action: 'พฤติกรรม Scraping ที่น่าสงสัย', count: 450, timestamp: '2024-01-10 22:15:00', severity: 'medium', blocked: true },
  { id: 5, ip: '10.10.10.10', action: 'พยายามโจมตี XSS', count: 8, timestamp: '2024-01-10 18:45:22', severity: 'high', blocked: true },
];

export const mockChatHistories = [
  {
    id: 1, userId: 1, userName: 'สมชาย ใจดี', messages: [
      { role: 'user', content: 'ตลาดน้ำอัมพวาเปิดวันไหนบ้างครับ?', timestamp: '2024-01-11 14:30:00' },
      { role: 'assistant', content: 'ตลาดน้ำอัมพวาเปิดทุกวันศุกร์ เสาร์ อาทิตย์ และวันหยุดนักขัตฤกษ์ ตั้งแต่เวลา 16:00-21:00 น. ค่ะ...', timestamp: '2024-01-11 14:30:05' },
    ], tokensUsed: 245, createdAt: '2024-01-11 14:30:00'
  },
  {
    id: 2, userId: 4, userName: 'ผู้ดูแลระบบ', messages: [
      { role: 'user', content: 'แนะนำที่พักใกล้ตลาดร่มหุบหน่อยครับ', timestamp: '2024-01-11 10:15:00' },
      { role: 'assistant', content: 'น้องปลาทูแนะนำโฮมสเตย์สวนมะพร้าวริมคลอง อยู่ใกล้ตลาดร่มหุบเพียง 5 กิโลเมตร บรรยากาศริมน้ำสงบเงียบค่ะ...', timestamp: '2024-01-11 10:15:08' },
    ], tokensUsed: 312, createdAt: '2024-01-11 10:15:00'
  },
  {
    id: 3, userId: 2, userName: 'Admin น้องปลาทู', messages: [
      { role: 'user', content: 'วัดไหนที่น่าไปเที่ยวในสมุทรสงคราม?', timestamp: '2024-01-10 16:45:00' },
      { role: 'assistant', content: 'สมุทรสงครามมีวัดที่น่าสนใจหลายแห่งค่ะ เช่น วัดบางกุ้ง (โบสถ์ปรกโพธิ์) ที่มีต้นไม้ปกคลุมโบสถ์เก่าแก่ และวัดจุฬามณีที่มีพระประธานสวยงามมากค่ะ...', timestamp: '2024-01-10 16:45:12' },
    ], tokensUsed: 189, createdAt: '2024-01-10 16:45:00'
  },
];

export const mockDailyTrafficData = [
  { date: '15 ม.ค.', visitors: 1245 },
  { date: '16 ม.ค.', visitors: 1580 },
  { date: '17 ม.ค.', visitors: 1320 },
  { date: '18 ม.ค.', visitors: 1890 },
  { date: '19 ม.ค.', visitors: 2150 },
  { date: '20 ม.ค.', visitors: 1780 },
  { date: '21 ม.ค.', visitors: 1450 },
];

export const mockRealtimeTrafficData = [
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

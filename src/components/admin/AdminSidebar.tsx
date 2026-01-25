import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  MapPinned,
  Map, // Import Map icon
  Settings,
  Shield,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/' },
  { icon: Users, label: 'ผู้ใช้งาน', path: '/users' },
  { icon: MapPin, label: 'สถานที่ท่องเที่ยว', path: '/places' },
  { icon: MapPinned, label: 'จัดการสถานที่', path: '/places-admin' },
  { icon: Map, label: 'Map Editor', path: '/admin/map-editor' }, // New Item
  { icon: Settings, label: 'ตั้งค่าระบบ', path: '/config' },
  { icon: Shield, label: 'บันทึกความปลอดภัย', path: '/security' },
  { icon: MessageSquare, label: 'ประวัติแชท AI', path: '/chats' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">น้องปลาทู Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Status indicator */}
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="relative">
            <Activity className="w-5 h-5 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">ระบบออนไลน์</span>
              <span className="text-xs text-muted-foreground">บริการทั้งหมดทำงานปกติ</span>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'ออกจากระบบ' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

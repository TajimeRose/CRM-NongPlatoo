import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  fetchFirebaseUsers,
  resetUserPassword,
  toggleUserDisabled,
  deleteFirebaseUser,
  syncAllUsers,
  type FirebaseUser
} from '@/api/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus, Trash2, Ban, MoreHorizontal, Search, Shield, Loader2, RefreshCw,
  Mail, Phone, KeyRound, UserX, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Provider icons component
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface UserDisplay {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'disabled' | 'banned';
  lastLogin: string;
  createdAt: string;
  photoURL?: string;
  provider?: string; // 'email' | 'google' | 'phone' | 'facebook'
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'disable' | 'reset';
    userId: string;
    userName: string;
  } | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  // Format timestamp to readable date
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Detect provider from user data
  const detectProvider = (user: FirebaseUser): string => {
    if (user.email?.includes('@gmail.com') && !user.email?.includes('+')) {
      // Could be Google or Email - check if has password
      return user.photoURL ? 'google' : 'email';
    }
    if (user.photoURL?.includes('googleusercontent')) return 'google';
    if (user.photoURL?.includes('facebook')) return 'facebook';
    if (!user.email && user.id) return 'phone';
    return 'email';
  };

  // Fetch users from Firebase
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const firebaseUsers = await fetchFirebaseUsers();
      const displayUsers: UserDisplay[] = firebaseUsers.map(u => ({
        id: u.id,
        name: u.name || 'Unknown',
        email: u.email || '',
        role: u.role || 'user',
        status: 'active' as const,
        lastLogin: formatDate(u.updatedAt),
        createdAt: formatDate(u.createdAt || u.updatedAt),
        photoURL: u.photoURL,
        provider: detectProvider(u)
      }));
      setUsers(displayUsers);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้จาก Firebase ได้');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Provider icon component
  const ProviderIcon = ({ provider }: { provider?: string }) => {
    switch (provider) {
      case 'google':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10" title="Google">
            <GoogleIcon />
          </div>
        );
      case 'facebook':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1877F2]/20" title="Facebook">
            <FacebookIcon />
          </div>
        );
      case 'phone':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20" title="เบอร์โทร">
            <Phone className="w-4 h-4 text-green-500" />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20" title="อีเมล/รหัสผ่าน">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
        );
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    toast.info('ฟีเจอร์เพิ่มผู้ใช้ผ่าน Admin ยังไม่พร้อมใช้งาน');
    setIsAddDialogOpen(false);
  };

  // Firebase Admin actions
  const handleResetPassword = async (userId: string, email: string) => {
    const result = await resetUserPassword(userId);
    if (result.success) {
      toast.success(`สร้างลิงก์รีเซ็ตรหัสผ่านสำหรับ ${email} แล้ว`);
      if (result.link) {
        console.log('Reset link:', result.link);
      }
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }
    setConfirmDialog(null);
  };

  const handleDisableAccount = async (userId: string, currentlyDisabled: boolean) => {
    const result = await toggleUserDisabled(userId, !currentlyDisabled);
    if (result.success) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: currentlyDisabled ? 'active' as const : 'disabled' as const } : u
      ));
      toast.success(currentlyDisabled ? 'เปิดใช้งานบัญชีแล้ว' : 'ปิดการใช้งานบัญชีแล้ว');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }
    setConfirmDialog(null);
  };

  const handleDeleteAccount = async (userId: string) => {
    const result = await deleteFirebaseUser(userId);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('ลบบัญชีเรียบร้อยแล้ว');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }
    setConfirmDialog(null);
  };

  const handleSyncAllUsers = async () => {
    toast.info('กำลัง sync ผู้ใช้ทั้งหมด...');
    const result = await syncAllUsers();
    if (result.success) {
      toast.success(`Sync สำเร็จ! ${result.count} ผู้ใช้`);
      loadUsers(); // Reload the list
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge-success">ใช้งาน</span>;
      case 'disabled':
        return <span className="badge-warning">ปิดใช้งาน</span>;
      case 'banned':
        return <span className="badge-destructive">ถูกแบน</span>;
      default:
        return <span className="badge-status bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="badge-primary">Admin</span>;
      case 'moderator':
        return <span className="badge-status bg-chart-4/20 text-chart-4">Moderator</span>;
      default:
        return <span className="badge-status bg-muted text-muted-foreground">User</span>;
    }
  };

  return (
    <AdminLayout title="User Management" subtitle="จัดการผู้ใช้งานจาก Firebase">
      <div className="glass-card p-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>กำลังโหลดข้อมูลผู้ใช้จาก Firebase...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองใหม่
            </Button>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาผู้ใช้..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 input-dark"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={loadUsers} title="รีเฟรช">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  ผู้ใช้ทั้งหมด: <span className="text-foreground font-medium">{users.length}</span> คน
                </span>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  เพิ่มผู้ใช้
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead>ผู้ใช้</TableHead>
                    <TableHead>ผู้ให้บริการ</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>อัปเดตล่าสุด</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา' : 'ยังไม่มีผู้ใช้ในระบบ'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="table-row-hover border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ProviderIcon provider={user.provider} />
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.lastLogin}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  type: 'reset',
                                  userId: user.id,
                                  userName: user.email
                                })}
                              >
                                <KeyRound className="w-4 h-4 mr-2" />
                                รีเซ็ตรหัสผ่าน
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="w-4 h-4 mr-2" />
                                เปลี่ยน Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  type: 'disable',
                                  userId: user.id,
                                  userName: user.name
                                })}
                                className="text-warning"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                {user.status === 'disabled' ? 'เปิดใช้งานบัญชี' : 'ปิดการใช้งานบัญชี'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  type: 'delete',
                                  userId: user.id,
                                  userName: user.name
                                })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบบัญชี
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
            <DialogDescription>สร้างบัญชีผู้ใช้ใหม่พร้อมกำหนด role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddUser}>
              เพิ่มผู้ใช้
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmDialog?.open} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              {confirmDialog?.type === 'delete' && 'ยืนยันการลบบัญชี'}
              {confirmDialog?.type === 'disable' && 'ยืนยันการปิดใช้งาน'}
              {confirmDialog?.type === 'reset' && 'รีเซ็ตรหัสผ่าน'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.type === 'delete' && (
                <>คุณต้องการลบบัญชี <strong>{confirmDialog.userName}</strong> หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</>
              )}
              {confirmDialog?.type === 'disable' && (
                <>คุณต้องการปิดการใช้งานบัญชี <strong>{confirmDialog.userName}</strong> หรือไม่?</>
              )}
              {confirmDialog?.type === 'reset' && (
                <>ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง <strong>{confirmDialog.userName}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              ยกเลิก
            </Button>
            <Button
              variant={confirmDialog?.type === 'delete' ? 'destructive' : 'default'}
              onClick={() => {
                if (!confirmDialog) return;
                if (confirmDialog.type === 'delete') handleDeleteAccount(confirmDialog.userId);
                if (confirmDialog.type === 'disable') handleDisableAccount(confirmDialog.userId);
                if (confirmDialog.type === 'reset') handleResetPassword(confirmDialog.userId, confirmDialog.userName);
              }}
            >
              {confirmDialog?.type === 'delete' && 'ลบบัญชี'}
              {confirmDialog?.type === 'disable' && 'ปิดใช้งาน'}
              {confirmDialog?.type === 'reset' && 'ส่งลิงก์'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersManagement;

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    RefreshCw,
    Search,
    ThumbsUp,
    ThumbsDown,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackItem {
    id: number;
    feedback_type: 'like' | 'dislike';
    feedback_comment: string | null;
    createdAt: string;
    chat_log_id: number;
    user_message: string;
    ai_response: string;
}

const ChatFeedback = () => {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadFeedback = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/feedback`);
            if (!response.ok) {
                throw new Error('Failed to fetch feedback');
            }
            const data = await response.json();
            setFeedback(data);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            console.error('Error loading feedback:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeedback();
    }, []);

    const filteredFeedback = feedback.filter(
        (item) =>
            item.feedback_comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ai_response?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Chat Feedback" subtitle="ความคิดเห็นจากผู้ใช้ (Like/Dislike)">
            <div className="glass-card p-6">
                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>กำลังโหลดข้อมูล...</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <Button variant="outline" size="sm" onClick={loadFeedback}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            ลองใหม่
                        </Button>
                    </div>
                )}

                {!isLoading && (
                    <>
                        {/* Header / Search */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ค้นหา (ข้อความ/ความเห็น)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-64 input-dark"
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={loadFeedback} title="รีเฟรช">
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                จำนวนทั้งหมด: <span className="text-foreground font-medium">{feedback.length}</span> รายการ
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="w-40">วันที่</TableHead>
                                        <TableHead className="w-24">ประเภท</TableHead>
                                        <TableHead>ข้อความที่เกี่ยวข้อง</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFeedback.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล Feedback'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredFeedback.map((item) => (
                                            <TableRow key={item.id} className="table-row-hover border-border">
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleString('th-TH')}
                                                </TableCell>
                                                <TableCell>
                                                    {item.feedback_type === 'like' ? (
                                                        <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-fit text-xs font-medium">
                                                            <ThumbsUp className="w-3 h-3" />
                                                            <span>ชอบ</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-md w-fit text-xs font-medium">
                                                            <ThumbsDown className="w-3 h-3" />
                                                            <span>ไม่ชอบ</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-4 max-w-2xl">
                                                        {item.feedback_comment && (
                                                            <div className="text-sm border-l-2 border-primary pl-3 py-1 mb-3">
                                                                <span className="text-xs text-muted-foreground block mb-1">ความเห็นเพิ่มเติม:</span>
                                                                <span className="text-foreground">{item.feedback_comment}</span>
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
                                                            <span className="text-xs font-semibold block mb-1 uppercase tracking-wider opacity-70">User</span>
                                                            {item.user_message || '(ไม่พบข้อความ)'}
                                                        </div>
                                                        <div className="text-sm text-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                                                            <span className="text-xs font-semibold block mb-1 flex items-center gap-1 uppercase tracking-wider opacity-70">
                                                                <MessageSquare className="w-3 h-3" /> AI Response
                                                            </span>
                                                            <div className="whitespace-pre-wrap">
                                                                {item.ai_response || '(ไม่พบข้อความ)'}
                                                            </div>
                                                        </div>
                                                    </div>
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
        </AdminLayout>
    );
};

export default ChatFeedback;

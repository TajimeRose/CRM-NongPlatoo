import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PlacesDataTable from '@/components/admin/PlacesDataTable';
import PlaceEditForm from '@/components/admin/PlaceEditForm';
import CSVImportModal from '@/components/admin/CSVImportModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    Upload,
    Trash2,
    Loader2,
    RefreshCw,
    MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getPlaces,
    getPlace,
    createPlace,
    updatePlace,
    deletePlace,
    bulkDeletePlaces,
    type GetPlacesParams
} from '@/api/places';
import type { Place, CreatePlace, PaginationData } from '@/api/types';

const CATEGORY_OPTIONS = [
    { value: '', label: 'ทุกหมวดหมู่' },
    { value: 'ร้านอาหาร', label: 'ร้านอาหาร' },
    { value: 'คาเฟ่', label: 'คาเฟ่' },
    { value: 'โรงแรม', label: 'โรงแรม' },
    { value: 'สถานที่ท่องเที่ยว', label: 'สถานที่ท่องเที่ยว' },
    { value: 'ตลาด', label: 'ตลาด' },
    { value: 'วัด', label: 'วัด' },
];

import { useSearchParams } from 'react-router-dom';

const PlacesAdmin: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    // Data state
    const [places, setPlaces] = useState<Place[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState<'active' | 'inactive' | ''>('');
    const [minRating, setMinRating] = useState('');
    const [sortBy, setSortBy] = useState<GetPlacesParams['sortBy']>('id');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [currentPage, setCurrentPage] = useState(1);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Modal state
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isBulkDeleteConfirm, setIsBulkDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch places
    const fetchPlaces = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getPlaces({
                page,
                limit: 20,
                search: searchTerm,
                sortBy,
                sortOrder,
                category: categoryFilter,
                activeFilter,
                minRating,
            });

            setPlaces(response.data);
            setPagination(response.pagination);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching places:', err);
            setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลได้');
            toast.error('ไม่สามารถโหลดข้อมูลสถานที่ได้');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, sortBy, sortOrder, categoryFilter, activeFilter, minRating]);

    // Handle deep link editing
    useEffect(() => {
        if (editId && !isLoading && places.length === 0) {
            // Initial load or refresh - wait for places to load or fetch specific place
            const loadTargetPlace = async () => {
                try {
                    const place = await getPlace(parseInt(editId));
                    setEditingPlace(place);
                    setIsCreateMode(false);
                    // Clear param to avoid reopening on refresh, 
                    // or keep it to allow sharing links. 
                    // Let's keep it but remove if dialog is closed.
                } catch (err) {
                    console.error('Error loading deep-linked place:', err);
                    toast.error('ไม่สามารถโหลดข้อมูลสถานที่ที่ระบุได้');
                }
            };
            loadTargetPlace();
        }
        else if (editId && !isLoading && places.length > 0) {
            // Places loaded, check if in list
            const targetPlace = places.find(p => p.id === parseInt(editId));
            if (targetPlace) {
                setEditingPlace(targetPlace);
                setIsCreateMode(false);
            } else {
                // Not in current list (maybe pagination?), fetch individually
                getPlace(parseInt(editId)).then(place => {
                    setEditingPlace(place);
                    setIsCreateMode(false);
                }).catch(() => toast.error('ไม่พบสถานที่ที่ระบุ'));
            }
        }
    }, [editId, isLoading, places]);

    useEffect(() => {
        fetchPlaces(1);
    }, [fetchPlaces]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPlaces(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle selection
    const handleSelectPlace = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedIds(new Set(places.filter(p => p.id).map(p => p.id!)));
        } else {
            setSelectedIds(new Set());
        }
    };

    // Handle sort
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field as GetPlacesParams['sortBy']);
            setSortOrder('ASC');
        }
    };

    // Handle save place
    const handleSavePlace = async (data: CreatePlace) => {
        setIsSaving(true);

        try {
            if (editingPlace?.id) {
                // Update existing
                await updatePlace(editingPlace.id, data);
                toast.success('อัปเดตสถานที่สำเร็จ');
            } else {
                // Create new
                await createPlace(data);
                toast.success('สร้างสถานที่สำเร็จ');
            }

            setEditingPlace(null);
            setIsCreateMode(false);
            fetchPlaces(currentPage);
        } catch (err) {
            console.error('Error saving place:', err);
            toast.error(err instanceof Error ? err.message : 'ไม่สามารถบันทึกได้');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDeletePlace = async (id: number) => {
        try {
            await deletePlace(id);
            toast.success('ลบสถานที่สำเร็จ');
            setDeleteConfirmId(null);
            fetchPlaces(currentPage);
        } catch (err) {
            console.error('Error deleting place:', err);
            toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบได้');
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        try {
            const ids = Array.from(selectedIds);
            const result = await bulkDeletePlaces(ids);
            toast.success(`ลบสถานที่ ${result.deletedCount} รายการสำเร็จ`);
            setSelectedIds(new Set());
            setIsBulkDeleteConfirm(false);
            fetchPlaces(currentPage);
        } catch (err) {
            console.error('Error bulk deleting:', err);
            toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบได้');
        }
    };

    // Handle CSV import success
    const handleCSVImportSuccess = async (result: { insertedCount: number }) => {
        toast.success(`นำเข้าสถานที่ ${result.insertedCount} รายการสำเร็จ`);
        setIsCSVModalOpen(false);
        fetchPlaces(1);
    };

    return (
        <AdminLayout
            title="จัดการข้อมูลสถานที่"
            subtitle="เพิ่ม แก้ไข และจัดการข้อมูลสถานที่ทั้งหมด"
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        {/* Search & Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="ค้นหาสถานที่..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="หมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value || 'all'}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={activeFilter}
                                onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="สถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="active">เปิดใช้งาน</SelectItem>
                                    <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => fetchPlaces(currentPage)}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsCSVModalOpen(true)}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                นำเข้า CSV
                            </Button>

                            <Button
                                onClick={() => {
                                    setIsCreateMode(true);
                                    setEditingPlace({} as Place);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มสถานที่
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && (
                        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                            <span className="text-sm">
                                เลือก {selectedIds.size} รายการ
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                >
                                    ยกเลิกการเลือก
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsBulkDeleteConfirm(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    ลบที่เลือก
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <div className="glass-card p-6">
                    <PlacesDataTable
                        places={places}
                        selectedIds={selectedIds}
                        onSelectPlace={handleSelectPlace}
                        onSelectAll={handleSelectAll}
                        onEdit={(place) => {
                            setIsCreateMode(false);
                            setEditingPlace(place);
                        }}
                        onDelete={(id) => setDeleteConfirmId(id)}
                        onPageChange={(page) => fetchPlaces(page)}
                        currentPage={currentPage}
                        totalPages={pagination?.totalPages || 1}
                        sortBy={sortBy || 'id'}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        isLoading={isLoading}
                    />

                    {pagination && (
                        <div className="mt-4 text-sm text-muted-foreground text-center">
                            แสดง {places.length} จาก {pagination.totalCount} รายการ
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Create Dialog */}
            <Dialog
                open={!!editingPlace}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingPlace(null);
                        setIsCreateMode(false);
                        // Clear URL param when closing
                        if (editId) {
                            setSearchParams(params => {
                                params.delete('edit');
                                return params;
                            });
                        }
                    }
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            {isCreateMode ? 'เพิ่มสถานที่ใหม่' : 'แก้ไขสถานที่'}
                        </DialogTitle>
                        <DialogDescription>
                            {isCreateMode
                                ? 'กรอกข้อมูลเพื่อเพิ่มสถานที่ใหม่'
                                : 'แก้ไขข้อมูลสถานที่'}
                        </DialogDescription>
                    </DialogHeader>
                    <PlaceEditForm
                        place={editingPlace || undefined}
                        onSave={handleSavePlace}
                        onCancel={() => {
                            setEditingPlace(null);
                            setIsCreateMode(false);
                        }}
                        isLoading={isSaving}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteConfirmId !== null}
                onOpenChange={() => setDeleteConfirmId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบสถานที่นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteConfirmId && handleDeletePlace(deleteConfirmId)}
                        >
                            ลบ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog
                open={isBulkDeleteConfirm}
                onOpenChange={setIsBulkDeleteConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบหลายรายการ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบ {selectedIds.size} สถานที่ที่เลือกหรือไม่?
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleBulkDelete}
                        >
                            ลบ {selectedIds.size} รายการ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSuccess={handleCSVImportSuccess}
            />
        </AdminLayout>
    );
};

export default PlacesAdmin;

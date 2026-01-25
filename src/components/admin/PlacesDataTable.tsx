import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, MapPin, Star } from 'lucide-react';
import type { Place } from '@/api/types';

interface DataTableProps {
    places: Place[];
    selectedIds: Set<number>;
    onSelectPlace: (id: number) => void;
    onSelectAll: (selected: boolean) => void;
    onEdit: (place: Place) => void;
    onDelete: (id: number) => void;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    totalPages?: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    onSort: (field: string) => void;
    isLoading?: boolean;
}

const PlacesDataTable: React.FC<DataTableProps> = ({
    places,
    selectedIds,
    onSelectPlace,
    onSelectAll,
    onEdit,
    onDelete,
    onPageChange,
    currentPage = 1,
    totalPages = 1,
    sortBy,
    sortOrder,
    onSort,
    isLoading = false,
}) => {
    const formatDate = (value: string | undefined) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return value;
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) {
            return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
        }
        return sortOrder === 'ASC'
            ? <ChevronUp className="w-4 h-4 text-primary" />
            : <ChevronDown className="w-4 h-4 text-primary" />;
    };

    const handleSort = (field: string) => {
        onSort(field);
    };

    const allSelected = places.length > 0 && places.every(p => p.id && selectedIds.has(p.id));
    const someSelected = places.some(p => p.id && selectedIds.has(p.id)) && !allSelected;

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    ref={(el) => {
                                        if (el) {
                                            (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                                        }
                                    }}
                                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    ชื่อสถานที่
                                    <SortIcon field="name" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center gap-2">
                                    หมวดหมู่
                                    <SortIcon field="category" />
                                </div>
                            </TableHead>
                            <TableHead>ที่อยู่</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('rating')}
                            >
                                <div className="flex items-center gap-2">
                                    คะแนน
                                    <SortIcon field="rating" />
                                </div>
                            </TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    วันที่สร้าง
                                    <SortIcon field="created_at" />
                                </div>
                            </TableHead>
                            <TableHead className="w-24">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        กำลังโหลด...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : places.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                    ไม่พบข้อมูลสถานที่
                                </TableCell>
                            </TableRow>
                        ) : (
                            places.map((place) => (
                                <TableRow key={place.id} className="table-row-hover border-border">
                                    <TableCell>
                                        <Checkbox
                                            checked={place.id ? selectedIds.has(place.id) : false}
                                            onCheckedChange={() => place.id && onSelectPlace(place.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {place.image_url ? (
                                                    <img
                                                        src={place.image_url}
                                                        alt={place.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <span className="font-medium text-foreground">{place.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="badge-status bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                                            {place.category || 'ทั่วไป'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                        {place.address || '—'}
                                    </TableCell>
                                    <TableCell>
                                        {place.rating ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{place.rating.toFixed(1)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${place.is_active !== false
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {place.is_active !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(place.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onEdit(place)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => place.id && onDelete(place.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        หน้า {currentPage} จาก {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange?.(currentPage - 1)}
                        >
                            ก่อนหน้า
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange?.(currentPage + 1)}
                        >
                            ถัดไป
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlacesDataTable;

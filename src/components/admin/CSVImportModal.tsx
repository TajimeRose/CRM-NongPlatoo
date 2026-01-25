import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { uploadCSV, importCSV } from '@/api/places';
import type { Place, CSVValidationResult } from '@/api/types';

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (result: { insertedCount: number; insertedPlaces: Place[] }) => Promise<void>;
}

type Step = 'upload' | 'mapping' | 'preview';

const DB_COLUMNS = [
    { value: '', label: '— ไม่ใช้ —' },
    { value: 'name', label: 'ชื่อสถานที่ (name)' },
    { value: 'description', label: 'คำอธิบาย (description)' },
    { value: 'address', label: 'ที่อยู่ (address)' },
    { value: 'latitude', label: 'ละติจูด (latitude)' },
    { value: 'longitude', label: 'ลองจิจูด (longitude)' },
    { value: 'category', label: 'หมวดหมู่ (category)' },
    { value: 'opening_hours', label: 'เวลาเปิด-ปิด (opening_hours)' },
    { value: 'price_range', label: 'ระดับราคา (price_range)' },
    { value: 'price_min', label: 'ราคาต่ำสุด (price_min)' },
    { value: 'price_max', label: 'ราคาสูงสุด (price_max)' },
    { value: 'rating', label: 'คะแนน (rating)' },
    { value: 'image_url', label: 'URL รูปภาพ (image_url)' },
    { value: 'attraction_type', label: 'ประเภทสถานที่ (attraction_type)' },
    { value: 'is_active', label: 'สถานะ (is_active)' },
];

const CSVImportModal: React.FC<CSVImportModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [columnNames, setColumnNames] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [validation, setValidation] = useState<CSVValidationResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                setError('กรุณาเลือกไฟล์ CSV เท่านั้น');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            // First upload with empty mapping to get column names
            const result = await uploadCSV(file, {});
            setColumnNames(result.columnNames);

            // Auto-map columns with same names
            const autoMapping: Record<string, string> = {};
            result.columnNames.forEach(col => {
                const lowerCol = col.toLowerCase().trim();
                const matchedDbCol = DB_COLUMNS.find(
                    db => db.value && db.value.toLowerCase() === lowerCol
                );
                if (matchedDbCol) {
                    autoMapping[col] = matchedDbCol.value;
                }
            });
            setColumnMapping(autoMapping);

            setStep('mapping');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดไฟล์ได้');
        } finally {
            setIsUploading(false);
        }
    };

    const handleMappingChange = (csvColumn: string, dbColumn: string) => {
        setColumnMapping(prev => ({
            ...prev,
            [csvColumn]: dbColumn,
        }));
    };

    const handleValidate = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const result = await uploadCSV(file, columnMapping);
            setValidation(result.validation);
            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถตรวจสอบข้อมูลได้');
        } finally {
            setIsUploading(false);
        }
    };

    const handleImport = async () => {
        if (!validation || validation.validRows.length === 0) return;

        setIsImporting(true);
        setError(null);

        try {
            const result = await importCSV(validation.validRows);
            await onSuccess(result);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่สามารถนำเข้าข้อมูลได้');
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setStep('upload');
        setFile(null);
        setColumnNames([]);
        setColumnMapping({});
        setValidation(null);
        setError(null);
        onClose();
    };

    const renderUploadStep = () => (
        <div className="space-y-6">
            <div
                className="border-2 border-dashed rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                    {file ? file.name : 'เลือกไฟล์ CSV'}
                </p>
                <p className="text-sm text-muted-foreground">
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก
                </p>
            </div>

            {file && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );

    const renderMappingStep = () => (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                เลือก mapping สำหรับแต่ละ column จาก CSV ไปยังฐานข้อมูล
            </p>

            <div className="max-h-[400px] overflow-y-auto space-y-3">
                {columnNames.map((col) => (
                    <div key={col} className="flex items-center gap-4">
                        <div className="w-1/3">
                            <Label className="font-medium">{col}</Label>
                        </div>
                        <div className="flex-1">
                            <Select
                                value={columnMapping[col] || ''}
                                onValueChange={(value) => handleMappingChange(col, value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือก column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DB_COLUMNS.map((dbCol) => (
                                        <SelectItem key={dbCol.value} value={dbCol.value || 'none'}>
                                            {dbCol.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPreviewStep = () => (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">{validation?.totalRows || 0}</p>
                    <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {validation?.validRows.length || 0}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">ถูกต้อง</p>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {validation?.invalidRows.length || 0}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">ผิดพลาด</p>
                </div>
            </div>

            {/* Valid rows preview */}
            {validation && validation.validRows.length > 0 && (
                <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ข้อมูลที่พร้อมนำเข้า (แสดง 5 รายการแรก)
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ชื่อ</TableHead>
                                    <TableHead>หมวดหมู่</TableHead>
                                    <TableHead>ที่อยู่</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {validation.validRows.slice(0, 5).map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.category || '—'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {row.address || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Invalid rows */}
            {validation && validation.invalidRows.length > 0 && (
                <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        ข้อมูลที่มีข้อผิดพลาด
                    </h4>
                    <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>แถว</TableHead>
                                    <TableHead>ข้อผิดพลาด</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {validation.invalidRows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.rowNumber}</TableCell>
                                        <TableCell className="text-red-600 dark:text-red-400">
                                            {row.errors.join(', ')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'upload' && 'นำเข้าข้อมูลจาก CSV'}
                        {step === 'mapping' && 'เลือก Column Mapping'}
                        {step === 'preview' && 'ตรวจสอบข้อมูลก่อนนำเข้า'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload' && 'เลือกไฟล์ CSV ที่ต้องการนำเข้า'}
                        {step === 'mapping' && 'เลือกความสัมพันธ์ระหว่าง column ใน CSV กับฐานข้อมูล'}
                        {step === 'preview' && 'ตรวจสอบข้อมูลที่จะนำเข้า'}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="py-4">
                    {step === 'upload' && renderUploadStep()}
                    {step === 'mapping' && renderMappingStep()}
                    {step === 'preview' && renderPreviewStep()}
                </div>

                <DialogFooter>
                    {step === 'upload' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    'ถัดไป'
                                )}
                            </Button>
                        </>
                    )}

                    {step === 'mapping' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                ย้อนกลับ
                            </Button>
                            <Button
                                onClick={handleValidate}
                                disabled={isUploading || !Object.values(columnMapping).some(v => v === 'name')}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังตรวจสอบ...
                                    </>
                                ) : (
                                    'ตรวจสอบข้อมูล'
                                )}
                            </Button>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('mapping')}>
                                ย้อนกลับ
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || !validation || validation.validRows.length === 0}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังนำเข้า...
                                    </>
                                ) : (
                                    `นำเข้า ${validation?.validRows.length || 0} รายการ`
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CSVImportModal;

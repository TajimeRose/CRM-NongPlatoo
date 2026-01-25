import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Place, CreatePlace } from '@/api/types';

interface PlaceEditFormProps {
    place?: Partial<Place>;
    onSave: (data: CreatePlace) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const CATEGORY_OPTIONS = [
    'ร้านอาหาร',
    'ตลาด',
    'ตลาดน้ำ',
    'คาเฟ่',
    'บาร์',
    'ไนท์คลับ',
    'โรงแรม',
    'ที่พัก',
    'รีสอร์ท',
    'สถานที่ท่องเที่ยว',
    'ชายหาด',
    'เกาะ',
    'น้ำตก',
    'ภูเขา',
    'ถ้ำ',
    'วัด',
    'โบสถ์',
    'มัสยิด',
    'สวนสาธารณะ',
    'สวนสนุก',
    'สวนสัตว์',
    'พิพิธภัณฑ์',
    'ห้างสรรพสินค้า',
    'ศูนย์การค้า',
    'ร้านค้า',
    'สปา',
    'นวดแผนไทย',
    'โรงพยาบาล',
    'ธนาคาร',
    'สนามกีฬา',
    'โรงหนัง',
    'other',
];

const PRICE_RANGE_OPTIONS = ['$', '$$', '$$$', '$$$$'];

const PlaceEditForm: React.FC<PlaceEditFormProps> = ({
    place,
    onSave,
    onCancel,
    isLoading = false,
}) => {
    const [formData, setFormData] = useState<CreatePlace>({
        name: '',
        description: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        category: '',
        opening_hours: '',
        price_range: '',
        price_min: undefined,
        price_max: undefined,
        rating: undefined,
        image_url: '',
        attraction_type: '',
        is_active: true,
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const imageModifiedRef = React.useRef(false);

    useEffect(() => {
        if (place) {
            setFormData(prev => ({
                name: place.name || '',
                description: place.description || '',
                address: place.address || '',
                latitude: place.latitude,
                longitude: place.longitude,
                category: place.category || '',
                opening_hours: place.opening_hours || '',
                price_range: place.price_range || '',
                price_min: place.price_min,
                price_max: place.price_max,
                rating: place.rating,
                // Preserve manually uploaded image_url
                image_url: imageModifiedRef.current ? prev.image_url : (place.image_url || ''),
                attraction_type: place.attraction_type || '',
                is_active: place.is_active !== false,
            }));

            // Parse categories
            if (place.category) {
                setSelectedCategories(place.category.split(',').map(c => c.trim()));
            }
        }
    }, [place]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number | undefined = value;

        if (type === 'number') {
            parsedValue = value === '' ? undefined : parseFloat(value);
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category];

            setFormData(prev => ({ ...prev, category: newCategories.join(', ') }));
            return newCategories;
        });
    };

    const formatCoordinate = (value: number | string | undefined, decimalPlaces: number = 6): string => {
        if (value === undefined || value === null || value === '') return '';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '';
        return numValue.toFixed(decimalPlaces);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'ชื่อสถานที่จำเป็นต้องระบุ';
        } else if (formData.name.length > 255) {
            newErrors.name = 'ชื่อสถานที่ต้องไม่เกิน 255 ตัวอักษร';
        }

        if (formData.latitude !== undefined) {
            if (formData.latitude < -90 || formData.latitude > 90) {
                newErrors.latitude = 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90';
            }
        }

        if (formData.longitude !== undefined) {
            if (formData.longitude < -180 || formData.longitude > 180) {
                newErrors.longitude = 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180';
            }
        }

        if (formData.rating !== undefined) {
            if (formData.rating < 0 || formData.rating > 5) {
                newErrors.rating = 'คะแนนต้องอยู่ระหว่าง 0 ถึง 5';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        console.log('🔥 Saving place with data:', formData);
        console.log('🔥 image_url being sent:', formData.image_url);
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">ชื่อสถานที่ *</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ชื่อสถานที่"
                    className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="คำอธิบายสถานที่"
                    rows={3}
                />
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="ที่อยู่"
                />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="latitude">ละติจูด</Label>
                    <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={formatCoordinate(formData.latitude)}
                        onChange={handleInputChange}
                        placeholder="-90 ถึง 90"
                        className={errors.latitude ? 'border-destructive' : ''}
                    />
                    {errors.latitude && (
                        <p className="text-sm text-destructive">{errors.latitude}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longitude">ลองจิจูด</Label>
                    <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={formatCoordinate(formData.longitude)}
                        onChange={handleInputChange}
                        placeholder="-180 ถึง 180"
                        className={errors.longitude ? 'border-destructive' : ''}
                    />
                    {errors.longitude && (
                        <p className="text-sm text-destructive">{errors.longitude}</p>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                    {CATEGORY_OPTIONS.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategories.includes(cat)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-2">
                <Label htmlFor="opening_hours">เวลาเปิด-ปิด</Label>
                <Textarea
                    id="opening_hours"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleInputChange}
                    placeholder="เช่น: จันทร์-ศุกร์ 09:00-22:00&#10;เสาร์-อาทิตย์ 10:00-23:00"
                    rows={2}
                />
            </div>

            {/* Price */}
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price_range">ระดับราคา</Label>
                    <Select
                        value={formData.price_range || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, price_range: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRICE_RANGE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price_min">ราคาต่ำสุด</Label>
                    <Input
                        id="price_min"
                        name="price_min"
                        type="number"
                        min="0"
                        value={formData.price_min ?? ''}
                        onChange={handleInputChange}
                        placeholder="฿"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price_max">ราคาสูงสุด</Label>
                    <Input
                        id="price_max"
                        name="price_max"
                        type="number"
                        min="0"
                        value={formData.price_max ?? ''}
                        onChange={handleInputChange}
                        placeholder="฿"
                    />
                </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
                <Label htmlFor="rating">คะแนน (0-5)</Label>
                <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating ?? ''}
                    onChange={handleInputChange}
                    placeholder="0-5"
                    className={errors.rating ? 'border-destructive' : ''}
                />
                {errors.rating && (
                    <p className="text-sm text-destructive">{errors.rating}</p>
                )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <Label htmlFor="image_upload">รูปภาพ</Label>
                <input
                    id="image_upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    disabled={isUploading}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploading(true);
                        const formDataUpload = new FormData();
                        formDataUpload.append('image', file);

                        try {
                            const response = await fetch('http://localhost:3001/api/upload/image', {
                                method: 'POST',
                                body: formDataUpload,
                            });
                            const result = await response.json();
                            if (result.url) {
                                imageModifiedRef.current = true;
                                setFormData(prev => ({ ...prev, image_url: result.url }));
                                console.log('📸 Image uploaded, new URL:', result.url);
                            }
                        } catch (error) {
                            console.error('Upload error:', error);
                        } finally {
                            setIsUploading(false);
                        }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {isUploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังอัปโหลดรูปภาพ...</span>
                    </div>
                )}
                {formData.image_url && (
                    <div className="mt-2 relative inline-block">
                        <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
                <Label htmlFor="is_active">เปิดใช้งาน</Label>
                <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    ยกเลิก
                </Button>
                <Button type="submit" disabled={isLoading || isUploading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            กำลังบันทึก...
                        </>
                    ) : isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            รอรูปอัปโหลด...
                        </>
                    ) : (
                        'บันทึก'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default PlaceEditForm;

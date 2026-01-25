import React, { useEffect, useState } from 'react';
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
import { Loader2, Trash2, Save, X, Plus } from 'lucide-react';
import type { Place, CreatePlace } from '@/api/types';

interface PlaceSidePanelProps {
    place: Place | null;
    onSave: (data: CreatePlace) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    isNewPlace?: boolean;
}

const PRICE_RANGE_OPTIONS = ['', '$', '$$', '$$$', '$$$$'];

const PlaceSidePanel: React.FC<PlaceSidePanelProps> = ({
    place,
    onSave,
    onDelete,
    onCancel,
    isLoading,
    isNewPlace = false
}) => {
    const [formData, setFormData] = useState<CreatePlace>({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        category: '',
        opening_hours: '',
        price_range: '',
        price_min: undefined,
        price_max: undefined,
        rating: undefined,
        image_url: '',
        is_active: true,
    });

    // Helper to convert string/number to number
    const toNumber = (val: any): number => {
        if (val === null || val === undefined || val === '') return 0;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
    };

    useEffect(() => {
        if (place) {
            setFormData({
                name: place.name || '',
                description: place.description || '',
                address: place.address || '',
                latitude: toNumber(place.latitude),
                longitude: toNumber(place.longitude),
                category: place.category || '',
                opening_hours: place.opening_hours || '',
                price_range: place.price_range || '',
                price_min: place.price_min,
                price_max: place.price_max,
                rating: place.rating,
                image_url: place.image_url || '',
                is_active: place.is_active !== false,
            });
        }
    }, [place]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') {
            finalValue = value === '' ? undefined : parseFloat(value);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    if (!place) return null;

    return (
        <div className="h-full flex flex-col bg-card border-l border-border shadow-xl w-[400px] absolute right-0 top-0 z-[1000] overflow-hidden">
            <div className={`p-4 border-b border-border flex items-center justify-between ${isNewPlace ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <h3 className={`font-semibold text-lg flex items-center gap-2 ${isNewPlace ? 'text-green-600' : ''}`}>
                    {isNewPlace ? (
                        <>
                            <Plus className="w-5 h-5" />
                            เพิ่มสถานที่ใหม่
                        </>
                    ) : (
                        'แก้ไขสถานที่'
                    )}
                </h3>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <form id="place-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>ชื่อสถานที่ *</Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder={isNewPlace ? 'กรอกชื่อสถานที่ท่องเที่ยว' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>รายละเอียด</Label>
                        <Textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder={isNewPlace ? 'รายละเอียดเกี่ยวกับสถานที่นี้' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>ที่อยู่</Label>
                        <Input name="address" value={formData.address || ''} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>ละติจูด *</Label>
                            <Input
                                name="latitude"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={handleChange}
                                required
                                className={isNewPlace ? 'bg-green-50 border-green-200' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ลองจิจูด *</Label>
                            <Input
                                name="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={handleChange}
                                required
                                className={isNewPlace ? 'bg-green-50 border-green-200' : ''}
                            />
                        </div>
                    </div>

                    {isNewPlace && (
                        <p className="text-xs text-green-600">📍 พิกัดถูกกำหนดจากตำแหน่งที่คลิกบนแผนที่</p>
                    )}

                    <div className="space-y-2">
                        <Label>หมวดหมู่</Label>
                        <Input
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            placeholder="เช่น ร้านอาหาร, คาเฟ่, วัด"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>ช่วงราคา</Label>
                        <Select value={formData.price_range || ''} onValueChange={(val) => setFormData(prev => ({ ...prev, price_range: val }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือก" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRICE_RANGE_OPTIONS.map(opt => (
                                    <SelectItem key={opt || 'none'} value={opt || 'none'}>{opt || 'ไม่ระบุ'}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>เวลาทำการ</Label>
                        <Input name="opening_hours" value={formData.opening_hours || ''} onChange={handleChange} placeholder="เช่น 09:00-18:00" />
                    </div>

                    <div className="space-y-2">
                        <Label>คะแนน (0-5)</Label>
                        <Input name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating || ''} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>รูปภาพ</Label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formDataUpload = new FormData();
                                    formDataUpload.append('image', file);

                                    try {
                                        const response = await fetch('http://localhost:3001/api/upload/image', {
                                            method: 'POST',
                                            body: formDataUpload,
                                        });
                                        const result = await response.json();
                                        if (result.url) {
                                            setFormData(prev => ({ ...prev, image_url: result.url }));
                                        }
                                    } catch (error) {
                                        console.error('Upload error:', error);
                                    }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            />
                            {formData.image_url && (
                                <div className="relative">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded border" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))} />
                        <Label>เปิดใช้งาน</Label>
                    </div>
                </form>
            </div>

            <div className="p-4 border-t border-border bg-muted/50 gap-2 flex flex-col">
                {/* Delete button - only show for existing places */}
                {!isNewPlace && place?.id && (
                    <Button
                        variant="destructive"
                        className="w-full bg-red-100 text-red-600 hover:bg-red-200 border-0"
                        onClick={() => onDelete(place.id!)}
                        disabled={isLoading}
                        type="button"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        ลบสถานที่
                    </Button>
                )}

                <div className="flex gap-2">
                    <Button
                        className={`flex-1 text-white ${isNewPlace ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        form="place-form"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isNewPlace ? 'เพิ่มสถานที่' : 'บันทึก'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={onCancel}>
                        ยกเลิก
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlaceSidePanel;

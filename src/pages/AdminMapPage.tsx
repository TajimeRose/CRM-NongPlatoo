import React, { useState, useEffect } from 'react';
import MapEditorLayout from '@/components/admin/map/MapEditorLayout';
import type { Place, CreatePlace } from '@/api/types';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminMapPage: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get auth token from localStorage
    const getAuthToken = (): string | null => {
        return localStorage.getItem('admin_token');
    };

    const fetchPlaces = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/places?limit=1000`);
            const data = await response.json();
            if (data.data) {
                setPlaces(data.data);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
            toast.error('ไม่สามารถโหลดข้อมูลสถานที่ได้');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const handleSave = async (data: CreatePlace) => {
        setIsLoading(true);
        const token = getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/places`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save');
            }

            toast.success('บันทึกสถานที่สำเร็จ');
            fetchPlaces();
        } catch (error) {
            console.error('Error saving place:', error);
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณต้องการลบสถานที่นี้หรือไม่?')) return;

        setIsLoading(true);
        const token = getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/places/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });

            if (response.ok) {
                toast.success('ลบสถานที่สำเร็จ');
                fetchPlaces();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting place:', error);
            toast.error('ไม่สามารถลบได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">แก้ไขแผนที่</h1>
                <p className="text-muted-foreground mt-1">
                    คลิกบนแผนที่เพื่อเพิ่มสถานที่ใหม่ หรือคลิกที่หมุดเพื่อแก้ไข
                </p>
            </div>

            <MapEditorLayout
                places={places}
                onSave={handleSave}
                onDelete={handleDelete}
                onRefresh={fetchPlaces}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AdminMapPage;

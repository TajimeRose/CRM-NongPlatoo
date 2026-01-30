import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, MapPin, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapView from './MapView';
import PlaceSidePanel from './PlaceSidePanel';
import type { Place, CreatePlace } from '@/api/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MapEditorLayoutProps {
    places: Place[];
    onSave: (data: CreatePlace) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onRefresh: () => void;
    isLoading: boolean;
}

const MapEditorLayout: React.FC<MapEditorLayoutProps> = ({
    places, onSave, onDelete, onRefresh, isLoading
}) => {
    const navigate = useNavigate();
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [newPlaceCoords, setNewPlaceCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(places.map(p => p.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [places]);

    // Filter places based on selected category
    const filteredPlaces = useMemo(() => {
        if (selectedCategory === "all") return places;
        return places.filter(p => p.category === selectedCategory);
    }, [places, selectedCategory]);

    const selectedPlace = places.find(p => p.id === selectedPlaceId) || null;

    const handleSelectPlace = (place: Place) => {
        if (isAddMode) return; // Ignore marker clicks when in add mode
        setSelectedPlaceId(place.id || null);
        setNewPlaceCoords(null);
    };

    const handleCancelEdit = () => {
        setSelectedPlaceId(null);
        setNewPlaceCoords(null);
        setIsAddMode(false);
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (!isAddMode) return;
        setNewPlaceCoords({ lat, lng });
        setSelectedPlaceId(null);
    };

    const handleToggleAddMode = () => {
        setIsAddMode(!isAddMode);
        setNewPlaceCoords(null);
        setSelectedPlaceId(null);
    };

    const handleSaveNewPlace = async (data: CreatePlace) => {
        await onSave(data);
        setNewPlaceCoords(null);
        setIsAddMode(false);
    };

    // Create a "new place" object for the form when adding
    const newPlaceData: Place | null = newPlaceCoords ? {
        id: undefined,
        name: '',
        description: '',
        address: '',
        latitude: newPlaceCoords.lat,
        longitude: newPlaceCoords.lng,
        category: selectedCategory !== "all" ? selectedCategory : '', // Auto-fill category if selected
        opening_hours: '',
        price_range: '',
        rating: undefined,
        image_url: '',
        is_active: true,
    } : null;

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-3 border-b bg-card flex items-center justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-4 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/places-admin')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h2 className="font-semibold flex items-center gap-2 whitespace-nowrap">
                        <MapPin className="w-5 h-5 text-primary" />
                        แก้ไขแผนที่ ({filteredPlaces.length} สถานที่)
                    </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[180px]">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด ({places.length})</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat as string} value={cat as string}>
                                        {cat} ({places.filter(p => p.category === cat).length})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-6 w-px bg-border mx-2" />

                    {isAddMode ? (
                        <Button variant="destructive" size="sm" onClick={handleToggleAddMode}>
                            <X className="w-4 h-4 mr-2" />
                            ยกเลิกเพิ่ม
                        </Button>
                    ) : (
                        <Button variant="default" size="sm" onClick={handleToggleAddMode} className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มสถานที่
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        รีเฟรช
                    </Button>
                </div>
            </div>

            {/* Add Mode Instructions */}
            {isAddMode && !newPlaceCoords && (
                <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 text-green-600 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>คลิกบนแผนที่เพื่อเลือกตำแหน่งสถานที่ใหม่</span>
                </div>
            )}

            {/* Map Content - Full Height */}
            <div className="flex-1 relative">
                <MapView
                    places={filteredPlaces}
                    selectedPlaceId={selectedPlaceId}
                    onSelectPlace={handleSelectPlace}
                    onMapClick={isAddMode ? handleMapClick : undefined}
                    newPlaceCoords={newPlaceCoords}
                />

                {/* Side Panel for editing existing place */}
                {selectedPlaceId && selectedPlace && (
                    <PlaceSidePanel
                        place={selectedPlace}
                        onSave={onSave}
                        onDelete={onDelete}
                        onCancel={handleCancelEdit}
                        isLoading={isLoading}
                    />
                )}

                {/* Side Panel for adding new place */}
                {newPlaceCoords && newPlaceData && (
                    <PlaceSidePanel
                        place={newPlaceData}
                        onSave={handleSaveNewPlace}
                        onDelete={async () => { }} // No delete for new place
                        onCancel={handleCancelEdit}
                        isLoading={isLoading}
                        isNewPlace={true}
                    />
                )}
            </div>
        </div>
    );
};

export default MapEditorLayout;

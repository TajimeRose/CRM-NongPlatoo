import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { DefaultIcon, SelectedIcon, NewPlaceIcon } from './MapIcons';
import type { Place } from '@/api/types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
    places: Place[];
    selectedPlaceId: number | null;
    onSelectPlace: (place: Place) => void;
    onMapClick?: (lat: number, lng: number) => void;
    newPlaceCoords?: { lat: number; lng: number } | null;
}

// Component to handle map center changes
const MapUpdater: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
};

// Component to handle map click events
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const MapView: React.FC<MapViewProps> = ({
    places,
    selectedPlaceId,
    onSelectPlace,
    onMapClick,
    newPlaceCoords
}) => {
    // Default center (Amphawa Floating Market)
    const defaultCenter: [number, number] = [13.4258, 99.9550];

    // Helper to convert string/number to number
    const toNumber = (val: any): number | null => {
        if (val === null || val === undefined || val === '') return null;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? null : num;
    };

    const selectedPlace = places.find(p => p.id === selectedPlaceId);
    const selectedLat = selectedPlace ? toNumber(selectedPlace.latitude) : null;
    const selectedLng = selectedPlace ? toNumber(selectedPlace.longitude) : null;
    const mapCenter = selectedLat && selectedLng ? [selectedLat, selectedLng] as [number, number] : null;

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={11}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {mapCenter && <MapUpdater center={mapCenter} />}

                {/* Handle map clicks for adding new places */}
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                {/* Show temporary marker for new place location */}
                {newPlaceCoords && (
                    <Marker
                        position={[newPlaceCoords.lat, newPlaceCoords.lng]}
                        icon={NewPlaceIcon}
                    >
                        <Popup>
                            <div className="p-2 text-center">
                                <p className="font-semibold text-green-600">📍 ตำแหน่งใหม่</p>
                                <p className="text-xs text-gray-500">
                                    {newPlaceCoords.lat.toFixed(6)}, {newPlaceCoords.lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Existing places */}
                {places.map((place) => {
                    const lat = toNumber(place.latitude);
                    const lng = toNumber(place.longitude);
                    if (!lat || !lng) return null;

                    return (
                        <Marker
                            key={place.id}
                            position={[lat, lng]}
                            icon={place.id === selectedPlaceId ? SelectedIcon : DefaultIcon}
                            eventHandlers={{
                                click: () => onSelectPlace(place),
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{place.address}</p>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {place.category}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;

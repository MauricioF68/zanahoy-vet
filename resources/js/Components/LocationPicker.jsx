import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo de íconos de Leaflet en React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Componente utilitario para mover el mapa cuando cambia la posición desde el buscador
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 16);
    }, [center, map]);
    return null;
}

export default function LocationPicker({ defaultLat, defaultLng, defaultAddress, onLocationChange }) {
    const defaultPos = {
        lat: defaultLat ? parseFloat(defaultLat) : -8.11599, // Trujillo por defecto
        lng: defaultLng ? parseFloat(defaultLng) : -79.02998,
    };

    const [position, setPosition] = useState(defaultPos);
    const [address, setAddress] = useState(defaultAddress || '');
    const [searchResults, setSearchResults] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [gpsStatus, setGpsStatus] = useState('');

    // --- 1. DE TEXTO A COORDENADAS (Autocompletado) ---
    useEffect(() => {
        if (!isTyping || address.length < 4) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Buscamos en OpenStreetMap (limitado a Perú para mayor precisión, puedes quitar countrycodes)
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}&countrycodes=pe&limit=5`);
                const data = await res.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Error buscando dirección", error);
            }
        }, 800); // Espera 800ms después de que dejas de escribir para no saturar la API

        return () => clearTimeout(delayDebounceFn);
    }, [address, isTyping]);

    // --- 2. DE COORDENADAS A TEXTO (Reverse Geocoding) ---
    const fetchAddressFromCoords = async (lat, lng) => {
        setGpsStatus('Traduciendo ubicación...');
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
                setIsTyping(false); // Para que no dispare el autocompletado
                onLocationChange({ lat, lng, address: data.display_name });
            }
        } catch (error) {
            console.error("Error traduciendo coordenadas", error);
        } finally {
            setGpsStatus('');
        }
    };

    // --- 3. EVENTOS DEL MARCADOR (Arrastrar y Soltar) ---
    function DraggableMarker() {
        const markerRef = useRef(null);
        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    const marker = markerRef.current;
                    if (marker != null) {
                        const newPos = marker.getLatLng();
                        setPosition(newPos);
                        fetchAddressFromCoords(newPos.lat, newPos.lng);
                    }
                },
            }),
            [],
        );

        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
            },
        });

        return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />;
    }

    // --- 4. SELECCIONAR DEL AUTOCOMPLETADO ---
    const handleSelectResult = (result) => {
        const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPosition(newPos);
        setAddress(result.display_name);
        setSearchResults([]);
        setIsTyping(false);
        onLocationChange({ lat: newPos.lat, lng: newPos.lng, address: result.display_name });
    };

    // --- 5. OBTENER GPS MANUALMENTE ---
    const requestGPS = () => {
        setGpsStatus('Buscando señal GPS...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(newPos);
                    fetchAddressFromCoords(newPos.lat, newPos.lng);
                },
                (err) => setGpsStatus('❌ Activa el GPS de tu navegador.'),
                { enableHighAccuracy: true }
            );
        }
    };

    return (
        <div className="relative">
            {/* Buscador de Direcciones */}
            <div className="relative z-20 mb-3">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            setIsTyping(true);
                        }}
                        placeholder="Escribe tu dirección para buscar..." 
                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                    <button 
                        type="button" 
                        onClick={requestGPS}
                        className="bg-indigo-100 text-indigo-700 px-4 rounded-xl font-bold hover:bg-indigo-200 transition whitespace-nowrap"
                        title="Usar mi ubicación actual"
                    >
                        📍 Mi GPS
                    </button>
                </div>

                {/* Dropdown de Autocompletado */}
                {searchResults.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl rounded-xl mt-1 max-h-60 overflow-y-auto overflow-x-hidden">
                        {searchResults.map((res, index) => (
                            <li 
                                key={index} 
                                onClick={() => handleSelectResult(res)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 border-b last:border-0"
                            >
                                {res.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Mueve el pin al lugar exacto</span>
                <span className="text-xs font-bold text-indigo-600">{gpsStatus}</span>
            </div>

            {/* El Mapa */}
            <div className="h-72 w-full rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-inner relative z-0">
                <MapContainer center={position} zoom={16} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={position} />
                    <DraggableMarker />
                </MapContainer>
            </div>
        </div>
    );
}
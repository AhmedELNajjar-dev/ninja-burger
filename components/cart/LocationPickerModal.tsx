'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (location: {
    lat: number;
    lng: number;
    addressText: string;
    mapUrl: string;
  }) => void;
  onClose: () => void;
}

// Default center: Maadi, Cairo (Ninja Burger Area)
const DEFAULT_LAT = 29.9602;
const DEFAULT_LNG = 31.2589;

export function LocationPickerModal({
  initialLat = DEFAULT_LAT,
  initialLng = DEFAULT_LNG,
  onSelectLocation,
  onClose,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [addressPreview, setAddressPreview] = useState<string>('جاري تحديد العنوان...');
  const [isLocating, setIsLocating] = useState(false);

  // Reverse geocode using free OpenStreetMap Nominatim
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setAddressPreview('جاري جلب تفاصيل الموقع...');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      if (res.ok) {
        const data = await res.json();
        const display = data.display_name?.split(',').slice(0, 3).join('، ') || 'الموقع المحدد على الخريطة';
        setAddressPreview(display);
      } else {
        setAddressPreview(`إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setAddressPreview(`إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet on client-side
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapInstanceRef.current || !isMounted) return;

      // Fix Leaflet standard marker icon in Next.js bundlers
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 15);
      mapInstanceRef.current = map;

      // Free OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Force recalculating map size after modal animation
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);

      // Draggable marker
      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);
      markerRef.current = marker;

      fetchAddress(coords.lat, coords.lng);

      // Handle drag
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        fetchAddress(pos.lat, pos.lng);
      });

      // Handle map click
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        fetchAddress(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // HTML5 Built-in Geolocation (Detect Current Location)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('متصفحك لا يدعم تحديد الموقع التلقائي');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          mapInstanceRef.current.invalidateSize();
          markerRef.current.setLatLng([latitude, longitude]);
        }
        fetchAddress(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        alert('تعذر الوصول إلى موقعك. يرجى السماح للمتصفح بالوصول أو تحريك الدبوس يدوياً.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    const mapUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    onSelectLocation({
      lat: coords.lat,
      lng: coords.lng,
      addressText: addressPreview,
      mapUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-ninja-red text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ninja-yellow" />
            <h3 className="font-black text-lg">حدد موقعك على الخريطة</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Leaflet CSS link */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        {/* Map Container - Explicit height & width to prevent white canvas */}
        <div className="relative flex-1 w-full min-h-[350px] sm:min-h-[400px] h-[350px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />

          {/* Quick GPS button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="absolute top-3 right-3 z-[400] bg-white text-ninja-dark hover:bg-ninja-gray shadow-md px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-200"
          >
            <Navigation className={`w-4 h-4 text-ninja-red ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'جاري التحديد...' : 'موقعي الحالي 📍'}
          </button>
        </div>

        {/* Footer Address Preview & Confirmation */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3 z-20">
          <div className="text-right">
            <span className="text-xs text-gray-500 font-semibold block">الموقع المختار:</span>
            <p className="text-sm font-bold text-ninja-dark line-clamp-1">{addressPreview}</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 h-12 text-base font-bold flex items-center justify-center gap-2 shadow-ninja"
            >
              <Check className="w-5 h-5" />
              تأكيد هذا الموقع
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 px-4"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

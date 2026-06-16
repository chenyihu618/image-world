'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCountry, getAllScenicSpots } from '@/lib/data';
import type { ScenicSpot } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CHINA_BOUNDS = { north: 54, south: 18, west: 73, east: 135 };

interface MapContentProps {
  countryId: string;
}

export default function MapContent({ countryId }: MapContentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const initializedRef = useRef(false);
  const country = getCountry(countryId);

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return;
    initializedRef.current = true;

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [35, 108],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
        maxBounds: L.latLngBounds([CHINA_BOUNDS.south - 5, CHINA_BOUNDS.west - 5], [CHINA_BOUNDS.north + 5, CHINA_BOUNDS.east + 5]),
        maxBoundsViscosity: 1.0,
      });

      // CartoDB Dark 地图瓦片
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        
      }).addTo(map);

      // 中国区域发光边框
      L.rectangle(
        L.latLngBounds([CHINA_BOUNDS.south, CHINA_BOUNDS.west], [CHINA_BOUNDS.north, CHINA_BOUNDS.east]),
        { color: '#4fc3f7', weight: 2, fillColor: '#4fc3f7', fillOpacity: 0.03, dashArray: '8 8' }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;

      // 添加景区标记和弹出窗
      const allSpots = getAllScenicSpots();
      allSpots.forEach((spot) => {
        const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], { opacity: 0.9 });

        // 弹窗内容
        const popupHtml = `
          <div style="min-width:200px;background:rgba(15,20,40,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:12px 14px;backdrop-filter:blur(12px);font-family:system-ui,sans-serif;">
            <div style="font-size:15px;font-weight:600;color:white;margin-bottom:4px;">${spot.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:8px;">${spot.country} · ${spot.province}</div>
            <p style="font-size:12px;color:rgba(255,255,255,0.65);line-height:1.5;margin:0 0 10px 0;">${spot.description.slice(0, 60)}...</p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
              ${spot.tags.slice(0, 3).map(t => '<span style="padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.08);font-size:10px;color:rgba(255,255,255,0.5);">' + t + '</span>').join('')}
            </div>
            <div style="text-align:right;">
              <a href="/scenic/${spot.id}" style="display:inline-block;padding:6px 16px;border-radius:6px;background:#3b82f6;color:white;font-size:12px;text-decoration:none;font-weight:500;">进入景区</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 300,
          className: 'scenic-popup',
          closeButton: true,
          offset: L.point(0, -20),
        });

        marker.addTo(map);
      });

      if (country) {
        map.flyTo([country.coordinates.lat, country.coordinates.lng], 4.5, { duration: 1.5 });
      }

      setLoaded(true);
    } catch (e) {
      console.error('Map error:', e);
      setLoaded(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [countryId]);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-[#0e1225] flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }} />

      <style jsx global>{`
        .scenic-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 10px !important;
        }
        .scenic-popup .leaflet-popup-content {
          margin: 0 !important;
          min-width: 200px;
        }
        .scenic-popup .leaflet-popup-tip {
          background: rgba(15,20,40,0.95) !important;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .scenic-popup .leaflet-popup-close-button {
          color: rgba(255,255,255,0.5) !important;
          font-size: 16px !important;
          top: 6px !important;
          right: 6px !important;
        }
      `}</style>
    </div>
  );
}
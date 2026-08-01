"use client";

import {
  APIProvider,
  Map as GoogleMap,
  InfoWindow,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import Link from "next/link";
import { useEffect, useState } from "react";

export type SpotPin = {
  slug: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type SpotsMapProps = {
  apiKey: string;
  pins: SpotPin[];
  /** ピンが 0 件 / 1 件のときに使う地図中心 (新庄村役場あたり) */
  fallbackCenter: { lat: number; lng: number };
};

/**
 * 全ピンが収まるよう地図の表示範囲を自動調整する。
 * - 1 件: そのスポットを中心に固定ズーム
 * - 複数: fitBounds で全ピンを収める
 */
function FitBounds({ pins }: { pins: SpotPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || pins.length === 0) return;

    if (pins.length === 1) {
      map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
      map.setZoom(15);
      return;
    }

    // google.maps.LatLngBounds を直接使わず literal で範囲指定する
    // (@types/google.maps へ依存せず全ピンを収める)
    const lats = pins.map((pin) => pin.lat);
    const lngs = pins.map((pin) => pin.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      56,
    );
  }, [map, pins]);

  return null;
}

export function SpotsMap({ apiKey, pins, fallbackCenter }: SpotsMapProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const activePin = pins.find((pin) => pin.slug === activeSlug) ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200">
      <APIProvider apiKey={apiKey} language="ja" region="JP">
        <GoogleMap
          style={{ width: "100%", height: "320px" }}
          defaultCenter={fallbackCenter}
          defaultZoom={13}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.slug}
              position={{ lat: pin.lat, lng: pin.lng }}
              title={pin.name}
              onClick={() => setActiveSlug(pin.slug)}
            />
          ))}

          {activePin && (
            <InfoWindow
              position={{ lat: activePin.lat, lng: activePin.lng }}
              onCloseClick={() => setActiveSlug(null)}
            >
              <div className="min-w-40 max-w-56">
                <p className="text-base font-bold text-neutral-800">
                  {activePin.name}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {activePin.address}
                </p>
                <Link
                  href={`/spots/${activePin.slug}`}
                  className="mt-2 inline-block text-base font-bold text-spot-action no-underline"
                >
                  詳しく見る →
                </Link>
              </div>
            </InfoWindow>
          )}

          <FitBounds pins={pins} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}

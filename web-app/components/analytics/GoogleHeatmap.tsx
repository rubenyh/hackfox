"use client";

import { useMemo } from "react";
import { Circle, GoogleMap, useLoadScript } from "@react-google-maps/api";
import type { HeatmapPoint } from "@/components/analytics/types";

type GoogleHeatmapProps = {
  apiKey: string;
  points: HeatmapPoint[];
  center: { lat: number; lng: number };
};

const mapContainerStyle = { width: "100%", height: "100%" };
export function GoogleHeatmap({ apiKey, points, center }: GoogleHeatmapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const circleData = useMemo(() => {
    return points.map((point) => {
      const weight = Math.max(1, point.weight ?? 1);
      return {
        center: point.location,
        radius: Math.min(1200, 160 + weight * 6),
        opacity: Math.min(0.55, 0.2 + weight / 200),
      };
    });
  }, [points]);

  if (loadError) {
    return (
      <div className="analytics-map-fallback">
        No se pudo cargar Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="analytics-map-fallback">Cargando mapa...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f1eb" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#6f5f52" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#e0d3c3" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#d8e2ea" }] },
        ],
      }}
    >
      {circleData.map((circle, idx) => (
        <Circle
          key={`heat-circle-${idx}`}
          center={circle.center}
          radius={circle.radius}
          options={{
            strokeColor: "#7A1F2B",
            strokeOpacity: 0.12,
            strokeWeight: 1,
            fillColor: "#7A1F2B",
            fillOpacity: circle.opacity,
          }}
        />
      ))}
    </GoogleMap>
  );
}

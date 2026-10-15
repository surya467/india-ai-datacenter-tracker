import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, MapPin, Compass, CheckCircle2, Shield, Eye } from "lucide-react";
import { CITY_HUBS } from "../data/dataCenters";

// Strict geographic bounding box covering India
const INDIA_BOUNDS = [
  [6.2, 68.0], // South-West (Lakshadweep / Kanyakumari / Gujarat)
  [37.4, 97.6]  // North-East (Ladakh / Arunachal Pradesh)
];

export default function MapComponent({
  dataCenters,
  selectedDc,
  onSelectDc,
  osmNodes = [],
  showOsmLayer = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const osmMarkersLayerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("minimal-dark"); // "minimal-dark" | "minimal-light" | "osm"

  // Free, high-performance minimal tile layers (No API keys needed)
  const tileLayers = {
    "minimal-dark": "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    "minimal-light": "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  };

  const currentTileLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.0, 78.9629],
        zoom: 4.8,
        minZoom: 4.5,
        maxZoom: 16,
        maxBounds: INDIA_BOUNDS,
        maxBoundsViscosity: 1.0, // Hard boundary lock - keeps viewport strictly on India
        zoomControl: false,
        attributionControl: false
      });

      // Subtle custom zoom control bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Attribution control in a subtle bottom-right position
      L.control.attribution({ position: "bottomright", prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/" target="_blank" class="hover:underline">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="hover:underline">OSM</a>')
        .addTo(map);

      // Add default minimal dark tile layer
      const defaultTile = L.tileLayer(tileLayers["minimal-dark"], {
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);

      currentTileLayerRef.current = defaultTile;
      markersLayerRef.current = L.layerGroup().addTo(map);
      osmMarkersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  const switchTileLayer = (layerKey) => {
    if (!mapInstanceRef.current) return;
    setActiveLayer(layerKey);

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    const newTile = L.tileLayer(tileLayers[layerKey], {
      subdomains: layerKey === "osm" ? "abc" : "abcd",
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = newTile;
  };

  // Render Clean Minimal Data Center Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    dataCenters.forEach((dc) => {
      const itCapacityMW = dc.totalFacilityITMW || dc.itCapacityMW || 30;
      const isSelected = selectedDc?.id === dc.id;

      // Clean, refined palette (No neon):
      // Indigo/Blue for primary enterprise AI
      // Emerald badge for IndiaAI Mission empaneled
      // Crisp monochrome/dark slate theme
      const isHighPower = itCapacityMW >= 60;
      const isMedium = itCapacityMW >= 35;

      const size = isHighPower ? 34 : isMedium ? 28 : 24;
      const borderWidth = isSelected ? "2.5px" : "1.5px";
      const borderColor = isSelected ? "#3b82f6" : "#475569";
      const bgColor = isSelected ? "#1e293b" : "#0f172a";
      const textColor = isSelected ? "#ffffff" : "#e2e8f0";

      const customIcon = L.divIcon({
        className: "clean-marker-wrapper",
        html: `
          <div class="clean-marker" style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 9999px;
            background: ${bgColor};
            border: ${borderWidth} solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isSelected ? "0 4px 14px rgba(59, 130, 246, 0.4)" : "0 2px 6px rgba(0,0,0,0.5)"};
            position: relative;
          ">
            <span style="
              font-family: 'JetBrains Mono', monospace;
              font-size: ${size > 30 ? "11px" : "9px"};
              font-weight: 600;
              color: ${textColor};
              letter-spacing: -0.02em;
            ">
              ${itCapacityMW}
            </span>
            ${
              dc.isIndiaAiEmpaneled
                ? `<span style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 7px;
                    height: 7px;
                    background: #10b981;
                    border: 1.5px solid #0f172a;
                    border-radius: 9999px;
                  "></span>`
                : ""
            }
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 4]
      });

      const marker = L.marker([dc.latitude, dc.longitude], { icon: customIcon });

      // Clean Minimalist Popup
      const popupHtml = `
        <div style="padding: 14px; width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
              ${dc.operator}
            </span>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${
                dc.isIndiaAiEmpaneled
                  ? `<span style="font-size: 9px; font-weight: 600; background: #064e3b; color: #6ee7b7; padding: 1px 5px; border-radius: 4px;">IndiaAI</span>`
                  : ""
              }
              <span style="font-size: 11px; font-family: monospace; font-weight: 600; color: #10b981;">
                PUE ${dc.designPue || dc.pue}
              </span>
            </div>
          </div>

          <div style="font-size: 13px; font-weight: 600; color: #ffffff; line-height: 1.3; margin-bottom: 4px;">
            ${dc.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
            ${dc.city}, ${dc.state}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #171923; padding: 8px 10px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #232736;">
            <div>
              <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">IT CAPACITY</div>
              <div style="font-size: 13px; font-weight: 700; color: #f8fafc; font-family: monospace;">${itCapacityMW} MW</div>
              ${dc.aiDedicatedLoadMW ? `<div style="font-size: 9px; color: #818cf8;">AI: ${dc.aiDedicatedLoadMW} MW</div>` : ""}
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">WATER EVAP</div>
              <div style="font-size: 13px; font-weight: 700; color: #38bdf8; font-family: monospace;">${(dc.dailyWaterLiters / 1000000).toFixed(2)} MLD</div>
              <div style="font-size: 9px; color: #64748b;">${dc.wue} L/kWh</div>
            </div>
          </div>

          <button id="btn-inspect-${dc.id}" style="
            width: 100%;
            padding: 6px 12px;
            background: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s ease;
          ">
            View Telemetry &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-inspect-${dc.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectDc(dc);
          };
        }
      });

      marker.on("click", () => {
        onSelectDc(dc);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [dataCenters, selectedDc]);

  // Render OSM nodes if active
  useEffect(() => {
    if (!mapInstanceRef.current || !osmMarkersLayerRef.current) return;
    osmMarkersLayerRef.current.clearLayers();

    if (showOsmLayer && osmNodes.length > 0) {
      osmNodes.forEach((node) => {
        const osmIcon = L.divIcon({
          className: "osm-node-marker",
          html: `<div style="width: 8px; height: 8px; border-radius: 9999px; background: #64748b; border: 1px solid #94a3b8;"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        });

        const m = L.marker([node.latitude, node.longitude], { icon: osmIcon });
        m.bindPopup(`
          <div style="padding: 8px; font-size: 11px; color: #f1f5f9;">
            <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8;">OSM Listed Node</div>
            <div style="font-weight: 600; color: #ffffff; margin-top: 2px;">${node.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${node.city || ''} ${node.state || ''}</div>
          </div>
        `);
        osmMarkersLayerRef.current.addLayer(m);
      });
    }
  }, [osmNodes, showOsmLayer]);

  // Pan to selected DC
  useEffect(() => {
    if (selectedDc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedDc.latitude, selectedDc.longitude], 11, {
        duration: 1.0
      });
    }
  }, [selectedDc]);

  // Quick Hub Zoom
  const zoomToHub = (hubKey) => {
    if (!mapInstanceRef.current) return;
    if (hubKey === "all") {
      mapInstanceRef.current.flyTo([22.0, 78.9629], 4.8, { duration: 0.8 });
      return;
    }
    const hub = CITY_HUBS[hubKey];
    if (hub) {
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 10, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d0f17] shadow-lg">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar: Hub Jump Buttons */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-[#12141e]/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-md max-w-[88vw] sm:max-w-xl">
        <button
          onClick={() => zoomToHub("all")}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors bg-zinc-800 text-slate-200 hover:bg-zinc-700 flex items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>India Overview</span>
        </button>
        {Object.entries(CITY_HUBS).slice(0, 6).map(([city, info]) => (
          <button
            key={city}
            onClick={() => zoomToHub(city)}
            className="text-xs px-2 py-1 rounded-lg font-mono transition-colors text-slate-300 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
          >
            {city.split(" / ")[0]} <span className="text-[10px] text-zinc-500 font-mono">({info.count})</span>
          </button>
        ))}
      </div>

      {/* Map Theme Toggle Top-Right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#12141e]/90 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-md">
        <button
          onClick={() => switchTileLayer("minimal-dark")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeLayer === "minimal-dark"
              ? "bg-zinc-800 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Minimal Dark
        </button>
        <button
          onClick={() => switchTileLayer("minimal-light")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeLayer === "minimal-light"
              ? "bg-zinc-800 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Positron
        </button>
        <button
          onClick={() => switchTileLayer("osm")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeLayer === "osm"
              ? "bg-zinc-800 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Street
        </button>
      </div>

      {/* Clean Minimal Legend Bottom-Left */}
      <div className="absolute bottom-5 left-3 z-10 bg-[#12141e]/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 shadow-lg text-xs pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-4 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-zinc-500 bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
              52
            </div>
            <span>IT Capacity (MW)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>IndiaAI Empaneled</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Boundary: India Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

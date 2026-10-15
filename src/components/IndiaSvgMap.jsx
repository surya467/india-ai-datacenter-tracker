import React, { useState, useMemo, useRef } from "react";
import India from "@svg-maps/india";
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Zap, Droplets, Cpu, Layers } from "lucide-react";

// Calibrated geographic anchor centers on the @svg-maps/india SVG canvas (viewBox 0 0 612 696)
const CITY_ANCHORS = {
  "Navi Mumbai": { x: 122, y: 432, region: "MMR" },
  "Mumbai": { x: 118, y: 428, region: "MMR" },
  "Pune": { x: 135, y: 442, region: "Western" },
  "Noida": { x: 191, y: 211, region: "NCR" },
  "Greater Noida": { x: 194, y: 214, region: "NCR" },
  "Gurugram": { x: 182, y: 216, region: "NCR" },
  "Gandhinagar": { x: 96, y: 340, region: "Gujarat" },
  "Jamnagar": { x: 43, y: 355, region: "Gujarat" },
  "Chennai": { x: 240, y: 560, region: "Southern" },
  "Bengaluru": { x: 180, y: 556, region: "Southern" },
  "Hyderabad": { x: 222, y: 462, region: "Southern" },
  "Kolkata": { x: 418, y: 345, region: "Eastern" }
};

// Region presets for quick zooming
const REGION_PRESETS = [
  { name: "All India", viewBox: "0 0 612 696" },
  { name: "Mumbai (MMR)", viewBox: "80 390 100 90" },
  { name: "Delhi-NCR", viewBox: "150 180 80 70" },
  { name: "Bengaluru", viewBox: "140 520 80 70" },
  { name: "Chennai", viewBox: "200 520 80 70" },
  { name: "Hyderabad", viewBox: "180 430 80 70" },
  { name: "Gujarat", viewBox: "20 310 110 80" },
  { name: "Kolkata", viewBox: "380 310 80 70" }
];

export default function IndiaSvgMap({
  dataCenters = [],
  selectedDc = null,
  onSelectDc,
  selectedCity,
  setSelectedCity
}) {
  const [hoveredDc, setHoveredDc] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewBox, setViewBox] = useState("0 0 612 696");
  const [activeRegion, setActiveRegion] = useState("All India");
  const [mapMode, setMapMode] = useState("facilities"); // "facilities" | "clusters"
  const svgRef = useRef(null);

  // Compute precise coordinates for each facility (with subtle radial rosette for clustered cities)
  const facilityPins = useMemo(() => {
    const cityCount = {};
    return dataCenters.map((dc) => {
      const base = CITY_ANCHORS[dc.city] || { x: 200, y: 350 };
      cityCount[dc.city] = (cityCount[dc.city] || 0) + 1;
      const count = cityCount[dc.city];

      let offsetX = 0;
      let offsetY = 0;
      if (count > 1) {
        // Spread evenly in radial rosette
        const angle = ((count - 1) * 2 * Math.PI) / 8;
        const radius = 7 + Math.floor((count - 1) / 8) * 5;
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius;
      }

      const itMW = dc.totalFacilityITMW || dc.itCapacityMW || 30;
      // Size radius between 4.5 and 11px
      const radius = Math.max(4.5, Math.min(11, 4 + Math.sqrt(itMW) * 0.7));

      return {
        ...dc,
        svgX: Math.round((base.x + offsetX) * 10) / 10,
        svgY: Math.round((base.y + offsetY) * 10) / 10,
        radius,
        itMW
      };
    });
  }, [dataCenters]);

  // City cluster summaries
  const cityClusters = useMemo(() => {
    const clusters = {};
    dataCenters.forEach((dc) => {
      const base = CITY_ANCHORS[dc.city] || { x: 200, y: 350 };
      if (!clusters[dc.city]) {
        clusters[dc.city] = {
          city: dc.city,
          state: dc.state,
          x: base.x,
          y: base.y,
          count: 0,
          totalMW: 0,
          totalGPUs: 0,
          facilities: []
        };
      }
      clusters[dc.city].count += 1;
      clusters[dc.city].totalMW += (dc.totalFacilityITMW || dc.itCapacityMW || 0);
      clusters[dc.city].totalGPUs += (dc.gpuCount || 0);
      clusters[dc.city].facilities.push(dc);
    });
    return Object.values(clusters);
  }, [dataCenters]);

  // State-level facility counts for choropleth feedback
  const stateCounts = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      const s = dc.state?.toLowerCase();
      if (s) map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [dataCenters]);

  // Zoom handlers
  const handleZoom = (factor) => {
    const coords = viewBox.split(" ").map(Number);
    const [x, y, w, h] = coords;
    const newW = Math.max(60, Math.min(612, w * factor));
    const newH = Math.max(70, Math.min(696, h * factor));
    const newX = Math.max(0, Math.min(612 - newW, x + (w - newW) / 2));
    const newY = Math.max(0, Math.min(696 - newH, y + (h - newH) / 2));
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
    setZoomLevel(Math.round((612 / newW) * 10) / 10);
  };

  const handleResetZoom = () => {
    setViewBox("0 0 612 696");
    setZoomLevel(1);
    setActiveRegion("All India");
  };

  const handleRegionSelect = (preset) => {
    setActiveRegion(preset.name);
    setViewBox(preset.viewBox);
    const coords = preset.viewBox.split(" ").map(Number);
    setZoomLevel(Math.round((612 / coords[2]) * 10) / 10);
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative w-full h-full bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col select-none">
      {/* Top Minimal Toolbar */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        {/* Region Quick Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-medium mr-1 hidden sm:inline">Regions:</span>
          {REGION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleRegionSelect(preset)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeRegion === preset.name
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Mode Toggle & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Cluster / Facility Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setMapMode("facilities")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                mapMode === "facilities"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Facilities ({dataCenters.length})
            </button>
            <button
              onClick={() => setMapMode("clusters")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                mapMode === "clusters"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hub Clusters ({cityClusters.length})
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => handleZoom(0.75)}
              className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(1.33)}
              className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors border-l border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors border-l border-slate-200"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredDc(null);
          setHoveredState(null);
        }}
        className="relative flex-1 w-full h-[580px] md:h-[680px] bg-white flex items-center justify-center overflow-hidden cursor-default"
      >
        <svg
          viewBox={viewBox}
          className="w-full h-full max-h-[700px] transition-all duration-300"
          style={{ vectorEffect: "non-scaling-stroke" }}
        >
          {/* Subtle Grid Pattern for clean architectural feel */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="612" height="696" fill="url(#grid)" />

          {/* Render All 36 Indian States & UTs (Wikipedia Vector Geometry) */}
          <g id="states-layer">
            {India.locations.map((loc) => {
              const count = stateCounts[loc.name?.toLowerCase()] || 0;
              const isHovered = hoveredState?.id === loc.id;
              const hasDCs = count > 0;

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  d={loc.path}
                  aria-label={loc.name}
                  onClick={() => {
                    // Filter or zoom to state if clicked
                    if (hasDCs && setSelectedCity) {
                      const firstDc = dataCenters.find(d => d.state?.toLowerCase() === loc.name?.toLowerCase());
                      if (firstDc) setSelectedCity(firstDc.city);
                    }
                  }}
                  onMouseEnter={() => setHoveredState({ ...loc, dcCount: count })}
                  onMouseLeave={() => setHoveredState(null)}
                  fill={isHovered ? "#eff6ff" : hasDCs ? "#f8fafc" : "#fbfcfd"}
                  stroke={isHovered ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isHovered ? 1.5 : 0.65}
                  strokeLinejoin="round"
                  className="transition-colors duration-150 cursor-pointer"
                />
              );
            })}
          </g>

          {/* Render Data Center Facilities (Pins) */}
          {mapMode === "facilities" && (
            <g id="facilities-layer">
              {facilityPins.map((pin) => {
                const isSelected = selectedDc?.id === pin.id;
                const isHovered = hoveredDc?.id === pin.id;

                return (
                  <g
                    key={pin.id}
                    transform={`translate(${pin.svgX}, ${pin.svgY})`}
                    onClick={() => onSelectDc && onSelectDc(pin)}
                    onMouseEnter={() => setHoveredDc(pin)}
                    onMouseLeave={() => setHoveredDc(null)}
                    className="cursor-pointer"
                  >
                    {/* Outer pulse/selection ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={pin.radius + 6}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        strokeDasharray={isSelected ? "none" : "2,2"}
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Facility Circle in Blue Accent */}
                    <circle
                      r={pin.radius}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="1.75"
                      className="transition-transform duration-150 hover:scale-125"
                    />

                    {/* Inner Center Dot */}
                    <circle r={pin.radius > 6 ? 2.5 : 1.5} fill="#ffffff" />
                  </g>
                );
              })}
            </g>
          )}

          {/* Render City Hub Clusters */}
          {mapMode === "clusters" && (
            <g id="clusters-layer">
              {cityClusters.map((cluster) => {
                const isHovered = hoveredDc?.city === cluster.city;
                const radius = Math.max(14, Math.min(26, 12 + Math.sqrt(cluster.totalMW) * 0.7));

                return (
                  <g
                    key={cluster.city}
                    transform={`translate(${cluster.x}, ${cluster.y})`}
                    onClick={() => {
                      if (setSelectedCity) setSelectedCity(cluster.city);
                      setMapMode("facilities");
                    }}
                    onMouseEnter={() => setHoveredDc({ ...cluster.facilities[0], isCluster: true, cluster })}
                    onMouseLeave={() => setHoveredDc(null)}
                    className="cursor-pointer"
                  >
                    {/* Cluster Outer Ring */}
                    <circle
                      r={radius + 4}
                      fill="#eff6ff"
                      stroke="#2563eb"
                      strokeWidth="1"
                      opacity="0.8"
                    />

                    {/* Cluster Center Fill */}
                    <circle
                      r={radius}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Facility Count Badge */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="#ffffff"
                      fontSize={radius > 18 ? "11px" : "9px"}
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                    >
                      {cluster.count}
                    </text>

                    {/* Cluster Label below */}
                    <text
                      textAnchor="middle"
                      y={radius + 12}
                      fill="#0f172a"
                      fontSize="9px"
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {cluster.city} ({cluster.totalMW} MW)
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Card (Minimalist 2-Color Design) */}
        {hoveredDc && (
          <div
            className="absolute pointer-events-none z-30 bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-slate-900 transition-opacity"
            style={{
              left: Math.min(tooltipPos.x + 16, (svgRef.current?.clientWidth || 600) - 240),
              top: Math.max(10, tooltipPos.y - 60),
              width: "230px"
            }}
          >
            {hoveredDc.isCluster ? (
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                  DATA CENTER HUB
                </span>
                <h5 className="font-bold text-sm text-slate-900 mt-0.5">{hoveredDc.cluster.city}</h5>
                <p className="text-xs text-slate-500">{hoveredDc.cluster.state}</p>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">FACILITIES</span>
                    <span className="font-semibold text-slate-900">{hoveredDc.cluster.count} Campuses</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOTAL IT LOAD</span>
                    <span className="font-semibold text-blue-600">{hoveredDc.cluster.totalMW} MW</span>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600 mt-2 font-medium">Click to view all facilities &rarr;</p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                  {hoveredDc.operator}
                </span>
                <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">
                  {hoveredDc.name}
                </h5>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span>{hoveredDc.city}, {hoveredDc.state}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">IT POWER</span>
                    <span className="font-semibold text-blue-600">
                      {hoveredDc.totalFacilityITMW || hoveredDc.itCapacityMW} MW
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">WATER</span>
                    <span className="font-semibold text-slate-900">
                      {(hoveredDc.dailyWaterLiters / 1000000).toFixed(2)} MLD
                    </span>
                  </div>
                </div>

                {hoveredDc.gpuCount > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">AI Compute:</span>
                    <span className="font-semibold text-blue-600">
                      {hoveredDc.gpuCount.toLocaleString()} GPUs
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-blue-600 mt-2 font-medium">Click to open full profile &rarr;</p>
              </div>
            )}
          </div>
        )}

        {/* State Hover Pill */}
        {hoveredState && !hoveredDc && (
          <div className="absolute top-4 left-4 pointer-events-none bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm text-xs z-20">
            <span className="font-semibold text-slate-900">{hoveredState.name}</span>
            <span className="text-slate-500 ml-2">
              {hoveredState.dcCount > 0 ? `${hoveredState.dcCount} Data Centers` : "No AI DC recorded"}
            </span>
          </div>
        )}

        {/* Minimal Bottom Legend */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-2 rounded-lg text-[11px] text-slate-700 shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span>AI Data Center</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 rounded border border-slate-300 bg-slate-50 inline-block"></span>
            <span>State Boundary</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">Scale: {zoomLevel}x</span>
        </div>
      </div>
    </div>
  );
}

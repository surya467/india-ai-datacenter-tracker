import React from "react";
import {
  Server,
  MapPin,
  BarChart3,
  Search,
  Radio,
  Github,
  Zap,
  Cpu
} from "lucide-react";

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onRefreshOsm,
  isLoadingOsm,
  showOsmLayer,
  totalCapacityMW,
  totalWaterMLD
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e16]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & High-Level Metrics */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setCurrentView("map")}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">
                  India AI Data Center Tracker
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Mid-2026
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                1,575 MW Sector Stock • 38,231 IndiaAI GPUs
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge for Mobile */}
          <div className="flex md:hidden items-center gap-2 text-[10px] font-mono">
            <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
              1,575 MW
            </span>
            <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
              25.7 MLD
            </span>
          </div>
        </div>

        {/* Clean Minimal Search Input */}
        <div className="w-full md:w-72 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility, city, GPU, operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-blue-500 transition-colors font-sans"
          />
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Overpass API live toggle */}
          <button
            onClick={onRefreshOsm}
            disabled={isLoadingOsm}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition-colors ${
              showOsmLayer
                ? "bg-zinc-800 text-white border-zinc-600"
                : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
            }`}
            title="Toggle OpenStreetMap Live DC Layer"
          >
            <Radio className={`w-3 h-3 ${isLoadingOsm ? "animate-spin text-blue-400" : "text-zinc-400"}`} />
            <span className="hidden sm:inline">OSM Nodes</span>
          </button>

          {/* Clean Segmented Tab Switcher */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setCurrentView("map")}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                currentView === "map"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                currentView === "dashboard"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

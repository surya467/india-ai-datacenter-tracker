import React from "react";
import {
  Server,
  MapPin,
  BarChart3,
  Search,
  BookOpen,
  Info
} from "lucide-react";

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenApiModal,
  totalCapacityMW = 1575,
  totalWaterMLD = 25.7
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Sector Totals */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setCurrentView("map")}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  India AI Data Center Tracker
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Mid-2026 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                1,575 MW Sector Stock • 38,231 IndiaAI GPUs • 25.7 MLD Direct Water
              </p>
            </div>
          </div>

          {/* Quick Metrics for Small Screens */}
          <div className="flex md:hidden items-center gap-1.5 text-[11px] font-medium">
            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              1,575 MW
            </span>
            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              25.7 MLD
            </span>
          </div>
        </div>

        {/* Clean Minimal Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility, operator, city, GPU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Navigation & Methodology Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Methodology / Citations Button */}
          <button
            onClick={onOpenApiModal}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors font-medium"
            title="View Data Sources & PIB Methodology"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Data Sources</span>
          </button>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setCurrentView("map")}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === "map"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Vector Map</span>
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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

import React, { useState, useMemo } from "react";
import { DATA_CENTERS } from "./data/dataCenters";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import IndiaSvgMap from "./components/IndiaSvgMap";
import FacilityCard from "./components/FacilityCard";
import DataCenterDrawer from "./components/DataCenterDrawer";
import Dashboard from "./components/Dashboard";
import ApiHubModal from "./components/ApiHubModal";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Server
} from "lucide-react";

export default function App() {
  const [dataCenters, setDataCenters] = useState(DATA_CENTERS);
  const [selectedDc, setSelectedDc] = useState(null);
  const [currentView, setCurrentView] = useState("map"); // "map" | "dashboard"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCooling, setSelectedCooling] = useState("All Cooling Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [minCapacity, setMinCapacity] = useState(0);
  const [sortBy, setSortBy] = useState("capacity"); // "capacity" | "water" | "name"
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Filter & Search Logic
  const filteredDataCenters = useMemo(() => {
    return dataCenters.filter((dc) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dc.name.toLowerCase().includes(query);
        const matchesOp = dc.operator.toLowerCase().includes(query);
        const matchesCity = dc.city.toLowerCase().includes(query);
        const matchesState = dc.state?.toLowerCase().includes(query);
        const matchesHardware = dc.aiHardware?.toLowerCase().includes(query);
        const matchesCooling = dc.coolingType?.toLowerCase().includes(query);
        if (!matchesName && !matchesOp && !matchesCity && !matchesState && !matchesHardware && !matchesCooling) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== "All Cities") {
        if (dc.city !== selectedCity) return false;
      }

      // Cooling Tech filter
      if (selectedCooling !== "All Cooling Types") {
        if (selectedCooling.includes("Liquid") && !dc.coolingType.toLowerCase().includes("liquid") && !dc.coolingType.toLowerCase().includes("immersion")) {
          return false;
        }
        if (selectedCooling.includes("Closed-Loop") && !dc.coolingType.toLowerCase().includes("closed")) {
          return false;
        }
        if (selectedCooling.includes("Adiabatic") && !dc.coolingType.toLowerCase().includes("adiabatic")) {
          return false;
        }
        if (selectedCooling.includes("Marine") && !dc.coolingType.toLowerCase().includes("sea") && !dc.coolingType.toLowerCase().includes("marine")) {
          return false;
        }
      }

      // Operational Status
      if (selectedStatus !== "All Statuses") {
        if (dc.operationalStatus !== selectedStatus) return false;
      }

      // Min MW Capacity
      const itCapacity = dc.totalFacilityITMW || dc.itCapacityMW || 0;
      if (itCapacity < minCapacity) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const itA = a.totalFacilityITMW || a.itCapacityMW || 0;
      const itB = b.totalFacilityITMW || b.itCapacityMW || 0;
      if (sortBy === "capacity") return itB - itA;
      if (sortBy === "water") return b.dailyWaterLiters - a.dailyWaterLiters;
      return a.name.localeCompare(b.name);
    });
  }, [dataCenters, searchQuery, selectedCity, selectedCooling, selectedStatus, minCapacity, sortBy]);

  // Sector Aggregate Totals
  const totalCapacityMW = useMemo(() => {
    return dataCenters.reduce((acc, curr) => acc + (curr.totalFacilityITMW || curr.itCapacityMW || 0), 0);
  }, [dataCenters]);

  const totalWaterMLD = useMemo(() => {
    return (dataCenters.reduce((acc, curr) => acc + (curr.dailyWaterLiters || 0), 0) / 1000000).toFixed(1);
  }, [dataCenters]);

  const handleResetFilters = () => {
    setSelectedCity("All Cities");
    setSelectedCooling("All Cooling Types");
    setSelectedStatus("All Statuses");
    setMinCapacity(0);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Minimal Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        totalCapacityMW={totalCapacityMW}
        totalWaterMLD={totalWaterMLD}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Verification Status Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-slate-900">
                  National Baseline: 1,575 MW Total Operational IT • 38,231 IndiaAI GPUs
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  PIB Verified (March 2026)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Accurate vector map of India drawn from official Wikipedia geographic geometry with zero external tile dependencies.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApiModalOpen(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Methodology & Citations</span>
          </button>
        </div>

        {/* VIEW 1: VECTOR MAP & FACILITY EXPLORER */}
        {currentView === "map" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <Filters
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCooling={selectedCooling}
              setSelectedCooling={setSelectedCooling}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              minCapacity={minCapacity}
              setMinCapacity={setMinCapacity}
              onReset={handleResetFilters}
              totalResults={filteredDataCenters.length}
            />

            {/* Split Vector Map & Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[720px]">
              {/* Vector SVG Map of India (7 Cols) */}
              <div className="lg:col-span-7 h-[500px] lg:h-full">
                <IndiaSvgMap
                  dataCenters={filteredDataCenters}
                  selectedDc={selectedDc}
                  onSelectDc={setSelectedDc}
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                />
              </div>

              {/* Mapped Facilities Column (5 Cols) */}
              <div className="lg:col-span-5 h-[500px] lg:h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                {/* List Header & Sorting */}
                <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">
                      Mapped Facilities
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      ({filteredDataCenters.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-800 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value="capacity">Sort: IT Power (MW)</option>
                      <option value="water">Sort: Water (MLD)</option>
                      <option value="name">Sort: Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Cards Scroll Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {filteredDataCenters.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-xs">
                      No data centers match the chosen filters. Try resetting filters.
                    </div>
                  ) : (
                    filteredDataCenters.map((dc) => (
                      <FacilityCard
                        key={dc.id}
                        dc={dc}
                        isSelected={selectedDc?.id === dc.id}
                        onSelect={setSelectedDc}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: GENERAL DASHBOARD */}
        {currentView === "dashboard" && (
          <Dashboard dataCenters={dataCenters} onSelectDc={setSelectedDc} />
        )}
      </main>

      {/* Slide-out Detailed Profile Drawer */}
      <DataCenterDrawer dc={selectedDc} onClose={() => setSelectedDc(null)} />

      {/* Methodology & Citations Modal */}
      <ApiHubModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            India AI Infrastructure & Environmental Telemetry Tracker
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              Citations & Methodology
            </button>
            <span className="text-slate-300">•</span>
            <span>PIB & JLL Mid-2026 Baseline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

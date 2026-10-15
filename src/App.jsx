import React, { useState, useMemo } from "react";
import { DATA_CENTERS } from "./data/dataCenters";
import { fetchOverpassDataCenters } from "./services/apiService";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import MapComponent from "./components/MapComponent";
import FacilityCard from "./components/FacilityCard";
import DataCenterDrawer from "./components/DataCenterDrawer";
import Dashboard from "./components/Dashboard";
import ApiHubModal from "./components/ApiHubModal";
import {
  Globe,
  Radio,
  ArrowUpDown,
  Zap,
  Droplets,
  Info,
  CheckCircle2,
  ExternalLink
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

  // OpenStreetMap Overpass state
  const [osmNodes, setOsmNodes] = useState([]);
  const [isLoadingOsm, setIsLoadingOsm] = useState(false);
  const [showOsmLayer, setShowOsmLayer] = useState(false);

  // API Documentation Modal
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
        const matchesState = dc.state.toLowerCase().includes(query);
        const matchesHardware = dc.aiHardware?.toLowerCase().includes(query);
        const matchesCooling = dc.coolingType.toLowerCase().includes(query);
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

  // Aggregate stats
  const totalCapacityMW = useMemo(() => {
    return dataCenters.reduce((acc, curr) => acc + (curr.totalFacilityITMW || curr.itCapacityMW || 0), 0);
  }, [dataCenters]);

  const totalWaterMLD = useMemo(() => {
    return (dataCenters.reduce((acc, curr) => acc + (curr.dailyWaterLiters || 0), 0) / 1000000).toFixed(1);
  }, [dataCenters]);

  // Handle OSM Overpass API Fetch
  const handleFetchOsm = async () => {
    if (showOsmLayer) {
      setShowOsmLayer(false);
      return;
    }

    if (osmNodes.length > 0) {
      setShowOsmLayer(true);
      return;
    }

    setIsLoadingOsm(true);
    try {
      const nodes = await fetchOverpassDataCenters();
      setOsmNodes(nodes);
      setShowOsmLayer(true);
    } catch (err) {
      alert("Notice: OpenStreetMap Overpass API is currently busy. Falling back to primary verified AI facility catalog.");
    } finally {
      setIsLoadingOsm(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCity("All Cities");
    setSelectedCooling("All Cooling Types");
    setSelectedStatus("All Statuses");
    setMinCapacity(0);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefreshOsm={handleFetchOsm}
        isLoadingOsm={isLoadingOsm}
        showOsmLayer={showOsmLayer}
        setShowOsmLayer={setShowOsmLayer}
        totalCapacityMW={totalCapacityMW}
        totalWaterMLD={totalWaterMLD}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Clean Context Banner */}
        <div className="bg-[#10121a] border border-zinc-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-white">
                  Operational Baseline: 1,575 MW Total Sector Stock • 38,231 IndiaAI GPUs
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                  PIB Verified (March 2026)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Dynamic cooling evaporation rates and operational PUE are calculated in real-time via Open-Meteo atmospheric telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApiModalOpen(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-sans flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>APIs & Data Sources</span>
          </button>
        </div>

        {/* VIEW 1: MAP & FACILITIES EXPLORER */}
        {currentView === "map" && (
          <div className="space-y-3.5">
            {/* Filter Controls */}
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

            {/* Split Map & Facility List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[720px]">
              {/* Map Column (7 Cols on desktop) */}
              <div className="lg:col-span-7 h-[450px] lg:h-full">
                <MapComponent
                  dataCenters={filteredDataCenters}
                  selectedDc={selectedDc}
                  onSelectDc={setSelectedDc}
                  osmNodes={osmNodes}
                  showOsmLayer={showOsmLayer}
                />
              </div>

              {/* Facility Cards List Column (5 Cols on desktop) */}
              <div className="lg:col-span-5 h-[500px] lg:h-full flex flex-col bg-[#10121a] rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
                {/* List Header & Sorting */}
                <div className="p-3 border-b border-zinc-800 bg-[#131520] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-white">
                      Mapped Facilities
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">
                      ({filteredDataCenters.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="capacity">Sort: IT Power (MW)</option>
                      <option value="water">Sort: Water (MLD)</option>
                      <option value="name">Sort: Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Cards Scrollable Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredDataCenters.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 text-xs font-sans">
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

      {/* Slide-out Data Center Drawer / Modal */}
      <DataCenterDrawer dc={selectedDc} onClose={() => setSelectedDc(null)} />

      {/* API Intelligence Hub Modal */}
      <ApiHubModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />

      {/* Clean Minimal Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#090a0f] py-4 px-6 text-center text-xs text-zinc-500 font-sans mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            India AI Infrastructure & Environmental Telemetry Tracker
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Sources & Methodology
            </button>
            <span>•</span>
            <span>PIB & JLL Mid-2026 Baseline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

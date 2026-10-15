import React from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function Filters({
  selectedCity,
  setSelectedCity,
  selectedCooling,
  setSelectedCooling,
  selectedStatus,
  setSelectedStatus,
  minCapacity,
  setMinCapacity,
  onReset,
  totalResults
}) {
  const cities = [
    "All Cities",
    "Navi Mumbai",
    "Mumbai",
    "Noida",
    "Greater Noida",
    "Chennai",
    "Hyderabad",
    "Bengaluru",
    "Pune",
    "Gurugram",
    "Gandhinagar",
    "Jamnagar",
    "Kolkata"
  ];

  const coolingTypes = [
    "All Cooling Types",
    "Liquid Cooling (Direct-to-Chip / Immersion)",
    "Closed-Loop Hybrid Chillers",
    "Adiabatic / Free-Cooling",
    "Marine / Seawater Heat-Exchange"
  ];

  const statuses = ["All Statuses", "Operational", "Expansion Phase", "Under Construction"];

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2.5 justify-between shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter:</span>
        </div>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Cooling Tech Filter */}
        <select
          value={selectedCooling}
          onChange={(e) => setSelectedCooling(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
        >
          {coolingTypes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Operational Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Min Capacity Slider */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-medium">
          <span className="text-slate-500">Min Load:</span>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="w-16 accent-blue-600 cursor-pointer h-1.5"
          />
          <span className="font-semibold text-slate-900 w-8">{minCapacity} MW</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-500">
          Showing <strong className="text-slate-900 font-semibold">{totalResults}</strong> facilities
        </span>

        <button
          onClick={onReset}
          className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors font-medium cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

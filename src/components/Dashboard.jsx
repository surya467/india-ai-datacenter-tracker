import React, { useState, useMemo } from "react";
import {
  Zap,
  Droplets,
  Cpu,
  BarChart3,
  Download,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ArrowUpDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { exportToCSV, exportToGeoJSON } from "../services/apiService";
import { getCalibratedStats } from "../data/dataCenters";

export default function Dashboard({ dataCenters, onSelectDc }) {
  const [tableSearch, setTableSearch] = useState("");
  const [tableSort, setTableSort] = useState("capacity"); // "capacity" | "water" | "gpus"

  // Calibrated benchmark statistics
  const stats = useMemo(() => {
    return getCalibratedStats();
  }, [dataCenters]);

  // Regional IT Capacity Chart Data
  const regionalData = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      const city = dc.city || "Other";
      if (!map[city]) map[city] = { city, itMW: 0, aiMW: 0, count: 0 };
      map[city].itMW += (dc.totalFacilityITMW || dc.itCapacityMW || 0);
      map[city].aiMW += (dc.aiDedicatedLoadMW || 0);
      map[city].count += 1;
    });
    return Object.values(map).sort((a, b) => b.itMW - a.itMW);
  }, [dataCenters]);

  // Operator GPU Fleet Chart Data
  const operatorGpuData = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      const op = dc.operator.split(" ")[0]; // short name
      if (!map[op]) map[op] = { operator: op, gpus: 0 };
      map[op].gpus += (dc.gpuCount || 0);
    });
    return Object.values(map)
      .filter((d) => d.gpus > 0)
      .sort((a, b) => b.gpus - a.gpus)
      .slice(0, 8);
  }, [dataCenters]);

  // Filtered & Sorted Data Table
  const tableRows = useMemo(() => {
    return dataCenters
      .filter((dc) => {
        if (!tableSearch.trim()) return true;
        const q = tableSearch.toLowerCase();
        return (
          dc.name.toLowerCase().includes(q) ||
          dc.operator.toLowerCase().includes(q) ||
          dc.city.toLowerCase().includes(q) ||
          dc.state.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (tableSort === "capacity") {
          return (b.totalFacilityITMW || b.itCapacityMW || 0) - (a.totalFacilityITMW || a.itCapacityMW || 0);
        }
        if (tableSort === "water") {
          return b.dailyWaterLiters - a.dailyWaterLiters;
        }
        if (tableSort === "gpus") {
          return (b.gpuCount || 0) - (a.gpuCount || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [dataCenters, tableSearch, tableSort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900 bg-white">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              NATIONAL BENCHMARK • MID-2026 CALIBRATED
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            India AI & Hyperscale Infrastructure Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Verified aggregate operational capacity, dedicated artificial intelligence compute load, IndiaAI Mission accelerator fleet, and environmental water footprint across Indian data center hubs.
          </p>
        </div>

        {/* Export Data Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(dataCenters)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToGeoJSON(dataCenters)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>GeoJSON</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Minimalist KPI Cards (2 Colors: Slate + Blue) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Operational IT Capacity */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TOTAL OPERATIONAL IT
            </span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1,575</span>
            <span className="text-sm font-semibold text-blue-600">MW IT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sector stock across enterprise & cloud (PIB & JLL Mid-2026)
          </p>
        </div>

        {/* Card 2: Dedicated AI Compute Load */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              DEDICATED AI LOAD
            </span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">~372</span>
            <span className="text-sm font-semibold text-blue-600">MW AI</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ~24% of national operational capacity allocated to AI clusters
          </p>
        </div>

        {/* Card 3: IndiaAI Empaneled GPU Fleet */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              INDIAAI ACCELERATORS
            </span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">38,231</span>
            <span className="text-sm font-semibold text-slate-700">GPUs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Government IndiaAI Mission subsidized compute pillar (March 2026)
          </p>
        </div>

        {/* Card 4: Water Footprint */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              EVAPORATIVE WATER
            </span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">25.7</span>
            <span className="text-sm font-semibold text-blue-600">MLD</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Million Liters / Day direct cooling (ASHRAE TC 9.9 WUE model)
          </p>
        </div>
      </div>

      {/* Charts Row: Minimalist 2-Color Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: IT Capacity by Hub */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">IT Capacity by Metropolitan Hub (MW)</h3>
              <p className="text-[11px] text-slate-500">Operational IT Load vs Dedicated AI Slice</p>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Top Hubs
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="city"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-md text-xs text-slate-900">
                          <p className="font-bold">{data.city}</p>
                          <p className="text-blue-600 font-semibold">Total IT: {data.itMW} MW</p>
                          <p className="text-slate-500">AI Dedicated: {data.aiMW} MW</p>
                          <p className="text-slate-500">{data.count} Data Centers</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="itMW" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: AI Accelerator Fleet by Operator */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Hardware Fleet by Major Operator</h3>
              <p className="text-[11px] text-slate-500">NVIDIA H100, Blackwell B200 & Custom Silicon</p>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              IndiaAI Empaneled
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operatorGpuData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="operator" stroke="#0f172a" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-md text-xs text-slate-900">
                          <p className="font-bold">{data.operator}</p>
                          <p className="text-blue-600 font-semibold">{data.gpus.toLocaleString()} Accelerators</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="gpus" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facilities Complete Data Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">All Tracked Facilities ({tableRows.length})</h3>
            <p className="text-[11px] text-slate-500">Click any row to open the complete deep-dive facility profile</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
            <select
              value={tableSort}
              onChange={(e) => setTableSort(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="capacity">Sort: Capacity</option>
              <option value="water">Sort: Water Usage</option>
              <option value="gpus">Sort: GPU Fleet</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">IT Load (MW)</th>
                <th className="py-2.5 px-3 text-right">AI Load (MW)</th>
                <th className="py-2.5 px-3 text-right">Daily Water (MLD)</th>
                <th className="py-2.5 px-3 text-right">Accelerators</th>
                <th className="py-2.5 px-3 text-center">PUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((dc) => (
                <tr
                  key={dc.id}
                  onClick={() => onSelectDc(dc)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{dc.name}</span>
                      {dc.isIndiaAiEmpaneled && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          IndiaAI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{dc.operator}</td>
                  <td className="py-2.5 px-3 text-slate-500">{dc.city}, {dc.state}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {dc.totalFacilityITMW || dc.itCapacityMW}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-blue-600">
                    {dc.aiDedicatedLoadMW || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {(dc.dailyWaterLiters / 1000000).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    {dc.gpuCount > 0 ? dc.gpuCount.toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {dc.designPue || dc.pue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

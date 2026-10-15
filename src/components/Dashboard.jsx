import React, { useState, useMemo } from "react";
import {
  Zap,
  Droplets,
  Cpu,
  Activity,
  Leaf,
  Home,
  Users,
  TrendingUp,
  Download,
  Flame,
  Layers,
  Sparkles,
  BarChart3,
  PieChart,
  HelpCircle,
  Database,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { exportToCSV, exportToGeoJSON, CEA_GRID_EMISSION_FACTOR } from "../services/apiService";
import { getCalibratedStats } from "../data/dataCenters";

export default function Dashboard({ dataCenters, onSelectDc }) {
  const [calculatorTokens, setCalculatorTokens] = useState(1000000);
  const [activeTab, setActiveTab] = useState("overview");

  // Calibrated benchmark statistics
  const stats = useMemo(() => {
    return getCalibratedStats();
  }, [dataCenters]);

  // Environmental Equivalents
  const equivalents = useMemo(() => {
    const dailyKWh = stats.totalDailyPowerMWh * 1000;
    // Physical thermal grid draw (accounting for RTC 34% green)
    const realThermalKWh = dailyKWh * (1 - stats.modelledRtcGreen / 100);
    const realDailyCarbonKg = realThermalKWh * CEA_GRID_EMISSION_FACTOR;
    const realDailyCarbonTonnes = Math.round(realDailyCarbonKg / 1000);
    const realAnnualCarbonTonnes = Math.round(realDailyCarbonTonnes * 365);

    // Paper PPA net offset carbon
    const nominalNonGreenKWh = dailyKWh * (1 - stats.contractedPpaGreen / 100);
    const nominalDailyCarbonTonnes = Math.round((nominalNonGreenKWh * CEA_GRID_EMISSION_FACTOR) / 1000);

    const householdsPowered = Math.round(dailyKWh / 3.2);
    const peopleDomesticWater = Math.round(stats.totalDailyWaterLiters / 135);

    return {
      realDailyCarbonTonnes,
      realAnnualCarbonTonnes,
      nominalDailyCarbonTonnes,
      householdsPowered,
      peopleDomesticWater
    };
  }, [stats]);

  // Regional Hub Distribution
  const regionalData = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      let hub = dc.city;
      if (dc.city === "Navi Mumbai" || dc.city === "Mumbai") hub = "Mumbai MMR";
      if (dc.city === "Greater Noida" || dc.city === "Noida" || dc.city === "Gurugram") hub = "Delhi-NCR";
      if (dc.city === "Gandhinagar" || dc.city === "Jamnagar") hub = "Gujarat";

      const itMW = dc.totalFacilityITMW || dc.itCapacityMW;
      const aiMW = dc.aiDedicatedLoadMW || 0;

      if (!map[hub]) {
        map[hub] = { name: hub, totalITMW: 0, aiDedicatedMW: 0, waterMLD: 0, count: 0, gpus: 0 };
      }
      map[hub].totalITMW += itMW;
      map[hub].aiDedicatedMW += aiMW;
      map[hub].waterMLD += dc.dailyWaterLiters / 1000000;
      map[hub].count += 1;
      map[hub].gpus += dc.gpuCount || 0;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        waterMLD: Math.round(item.waterMLD * 10) / 10
      }))
      .sort((a, b) => b.totalITMW - a.totalITMW);
  }, [dataCenters]);

  // Operator Market Share Data
  const operatorData = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      const op = dc.operator.split(" ")[0].replace(",", "");
      const itMW = dc.totalFacilityITMW || dc.itCapacityMW;
      if (!map[op]) {
        map[op] = { name: op, powerMW: 0, waterMLD: 0, gpus: 0 };
      }
      map[op].powerMW += itMW;
      map[op].waterMLD += dc.dailyWaterLiters / 1000000;
      map[op].gpus += dc.gpuCount || 0;
    });

    return Object.values(map)
      .sort((a, b) => b.powerMW - a.powerMW)
      .slice(0, 8);
  }, [dataCenters]);

  // Cooling Architecture Comparison Data
  const coolingData = useMemo(() => {
    const map = {};
    dataCenters.forEach((dc) => {
      let type = "Standard Chilled Water";
      if (dc.coolingType.toLowerCase().includes("direct-to-chip") || dc.coolingType.toLowerCase().includes("immersion")) {
        type = "Liquid / Immersion Cooling";
      } else if (dc.coolingType.toLowerCase().includes("adiabatic")) {
        type = "Adiabatic Free-Cooling";
      } else if (dc.coolingType.toLowerCase().includes("district") || dc.coolingType.toLowerCase().includes("sea")) {
        type = "District / Marine Loop";
      }

      const itMW = dc.totalFacilityITMW || dc.itCapacityMW;

      if (!map[type]) {
        map[type] = { name: type, capacityMW: 0, waterUsageMLD: 0, count: 0, avgWueSum: 0 };
      }
      map[type].capacityMW += itMW;
      map[type].waterUsageMLD += dc.dailyWaterLiters / 1000000;
      map[type].avgWueSum += dc.wue;
      map[type].count += 1;
    });

    return Object.values(map).map((t) => ({
      ...t,
      avgWue: (t.avgWueSum / t.count).toFixed(2),
      waterUsageMLD: Math.round(t.waterUsageMLD * 10) / 10
    }));
  }, [dataCenters]);

  // Seasonal Water Evaporation Simulation (Indian Monsoon vs Peak Summer)
  const seasonalData = [
    { month: "Jan (Winter)", temp: "24°C", waterIndex: 0.85, powerDrawIndex: 0.95 },
    { month: "Mar (Spring)", temp: "31°C", waterIndex: 1.05, powerDrawIndex: 1.02 },
    { month: "May (Peak Summer)", temp: "42°C", waterIndex: 1.48, powerDrawIndex: 1.22 },
    { month: "Jul (Monsoon)", temp: "29°C", waterIndex: 0.98, powerDrawIndex: 1.05 },
    { month: "Sep (Post-Monsoon)", temp: "30°C", waterIndex: 1.02, powerDrawIndex: 1.04 },
    { month: "Nov (Autumn)", temp: "26°C", waterIndex: 0.88, powerDrawIndex: 0.96 }
  ];

  // AI Calculator
  const calcTokensK = calculatorTokens / 1000;
  const calcPowerKWh = (calcTokensK * 0.0038).toFixed(2);
  const calcWaterLiters = (calcTokensK * 0.045).toFixed(2);
  const calcCarbonGrams = Math.round(calcPowerKWh * CEA_GRID_EMISSION_FACTOR * 1000);

  const COLORS = ["#06b6d4", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#64748b"];

  return (
    <div className="space-y-6">
      {/* Official Data Verification Alert Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white font-mono">
                  Verified National Dataset (Calibrated Mid-2026)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  PIB Verified • JLL/CBRE Indexed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                National IT capacity is calibrated to <strong>1,575 MW</strong> (entire operational data center stock across India as cited by PIB & JLL). The AI accelerator count reflects the official <strong>38,231 GPUs onboarded under the IndiaAI Mission (PIB, March 2026)</strong> plus verified private enterprise clusters (~50.6k total).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              Scope: National Operational Baseline
            </span>
          </div>
        </div>
      </div>

      {/* 6 High-Precision KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total IT Power */}
        <div className="bg-slate-900/80 border border-amber-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-amber-500/60 transition-colors">
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Sector IT Power</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalSectorITMW} <span className="text-xs text-amber-400 font-normal">MW IT</span>
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1 font-mono">
            AI Slice: ~{stats.totalAiDedicatedMW} MW (24%)
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            PIB & JLL Mid-2026 Verified
          </div>
        </div>

        {/* KPI 2: Total Grid Feed */}
        <div className="bg-slate-900/80 border border-orange-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-orange-500/60 transition-colors">
          <div className="flex items-center justify-between text-orange-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Grid Demand</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalFacilityMW} <span className="text-xs text-orange-400 font-normal">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {Math.round(stats.totalDailyPowerMWh * 1.35)} MWh/day Total
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Facility Connected Feed
          </div>
        </div>

        {/* KPI 3: Water Evaporation Footprint */}
        <div className="bg-slate-900/80 border border-cyan-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/60 transition-colors">
          <div className="flex items-center justify-between text-cyan-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Water / Day</span>
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalWaterMLD} <span className="text-xs text-cyan-400 font-normal">MLD</span>
          </div>
          <div className="text-[10px] text-cyan-300/80 mt-1 font-mono">
            Avg WUE: {stats.avgWue} L/kWh
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Modelled Evaporative Loss*
          </div>
        </div>

        {/* KPI 4: AI Fleet (PIB Verified) */}
        <div className="bg-slate-900/80 border border-purple-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-purple-500/60 transition-colors">
          <div className="flex items-center justify-between text-purple-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">IndiaAI Fleet</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.indiaAiEmpaneledGpus.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-1 font-mono">
            National Total: ~{stats.totalGpus.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            PIB March 2026 Verified
          </div>
        </div>

        {/* KPI 5: Fleet PUE (Design vs Operational) */}
        <div className="bg-slate-900/80 border border-emerald-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/60 transition-colors">
          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Fleet PUE</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.avgDesignPue} <span className="text-xs text-slate-400 font-normal">Design</span>
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-1 font-mono">
            Tropical Operational: {stats.avgOperationalPue}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Climate-adjusted via Open-Meteo
          </div>
        </div>

        {/* KPI 6: Green Power (PPA vs Real RTC) */}
        <div className="bg-slate-900/80 border border-teal-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-teal-500/60 transition-colors">
          <div className="flex items-center justify-between text-teal-400 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Green Power</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.contractedPpaGreen}% <span className="text-xs text-slate-400 font-normal">PPA</span>
          </div>
          <div className="text-[10px] text-teal-300/80 mt-1 font-mono">
            Real RTC Green: ~{stats.modelledRtcGreen}%
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Factoring solar intermittency
          </div>
        </div>
      </div>

      {/* Critical Methodology & Scope Disclosure Banner */}
      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
          <Info className="w-4 h-4" /> Methodological Clarifications & Source Verifications
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <strong className="text-amber-300 block mb-1">1. Scope of 1,575 MW Total Power:</strong>
            As established by official Press Information Bureau releases and JLL/CBRE reports, ~1,500–1,600 MW represents India's <em>entire operational data center stock</em> across all enterprise cloud, BFSI, and telecom workloads. Active dedicated AI workloads occupy approximately <strong>~372 MW</strong> (~24%) of this base.
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <strong className="text-purple-300 block mb-1">2. GPU Fleet Verification:</strong>
            The government-backed <strong>IndiaAI Mission reported exactly 38,231 high-performance GPUs onboarded</strong> in March 2026 across 14 empaneled providers (Yotta, E2E, Sify, CtrlS, etc.) accessible at subsidized ₹65/hr rates. Total national fleet including un-empaneled private hyperscalers (AWS, Azure, Google, Reliance) is estimated at <strong>~50,648 GPUs</strong>.
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <strong className="text-cyan-300 block mb-1">3. Water & PPA RTC Realities:</strong>
            India currently has no statutory public water metering disclosure for data centers (Ministry of Jal Shakti S.O. 3289(E) controls groundwater extraction). Water numbers reflect <strong>ASHRAE TC 9.9 modelled evaporative consumption</strong> (~25.7 MLD). Furthermore, while operators hold 71% nominal annual solar/wind PPAs, real-time Round-The-Clock (RTC) green electrons average ~34% due to solar intermittency.
          </div>
        </div>
      </div>

      {/* Carbon Emission Transparency Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">
              CEA India Grid Carbon Footprint Analysis (Factor: 0.716 kg CO₂e / kWh)
            </h4>
            <p className="text-xs text-slate-400">
              Evaluating physical thermal grid consumption vs. nominal annual paper PPA offsets:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-rose-900/50">
            <span className="text-slate-400 text-[10px] block">Real Hourly RTC Grid Carbon:</span>
            <span className="text-rose-400 font-bold text-sm">~{equivalents.realDailyCarbonTonnes.toLocaleString()} Tonnes/day</span>
            <span className="text-[9px] text-slate-500 block">({(equivalents.realAnnualCarbonTonnes / 1000000).toFixed(2)}M T/yr based on 34% RTC)</span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-emerald-900/50">
            <span className="text-slate-400 text-[10px] block">Nominal Net PPA Offset Carbon:</span>
            <span className="text-emerald-400 font-bold text-sm">~{equivalents.nominalDailyCarbonTonnes.toLocaleString()} Tonnes/day</span>
            <span className="text-[9px] text-slate-500 block">(If counting 71% annual paper offsets)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "overview"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Regional Hub Analysis (1,575 MW Total)
          </button>
          <button
            onClick={() => setActiveTab("cooling")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "cooling"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Cooling Tech & WUE Benchmarks
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Query Impact Calculator</span>
          </button>
        </div>

        {/* Data Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportToCSV(dataCenters)}
            className="text-xs px-2.5 py-1.5 rounded-lg font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Download CSV dataset with official citations"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => exportToGeoJSON(dataCenters)}
            className="text-xs px-2.5 py-1.5 rounded-lg font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Download GeoJSON with metadata"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">GeoJSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REGIONAL & HUB BREAKDOWN */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Total IT Power vs Dedicated AI Power */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Total Sector Power vs Dedicated AI Slices (MW)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Total operational capacity (1,575 MW) across metro hubs</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val, name) => [
                      `${val} MW`,
                      name === "totalITMW" ? "Total Sector IT Power" : "Active Dedicated AI Load"
                    ]}
                  />
                  <Bar dataKey="totalITMW" fill="#f59e0b" name="totalITMW" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aiDedicatedMW" fill="#8b5cf6" name="aiDedicatedMW" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block"></span> Total Sector IT (1,575 MW)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-purple-500 rounded-sm inline-block"></span> Dedicated AI Compute (~372 MW)
              </span>
            </div>
          </div>

          {/* Chart 2: Water Consumption by Metro Hub */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Modelled Daily Water Evaporation by Hub (MLD)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Total ~25.7 MLD on-site cooling evaporation loss</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val) => [`${val} MLD (${val * 1000} m³/day)`, "Evaporative Water"]}
                  />
                  <Bar dataKey="waterMLD" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operator Capacity Leaderboard */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Major Data Center Operators in India (Operational Stock)</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Total Empaneled IndiaAI GPUs: 38,231
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {operatorData.map((op, idx) => (
                <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white font-mono">{op.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">#{idx + 1}</span>
                  </div>
                  <div className="text-lg font-bold text-amber-400 font-mono">{op.powerMW} <span className="text-xs text-slate-400">MW IT</span></div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
                    <span>💧 {op.waterMLD.toFixed(1)} MLD</span>
                    <span>⚡ {op.gpus > 0 ? `${op.gpus.toLocaleString()} GPUs` : "Colo/Cloud"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COOLING TECH & WATER STRESS */}
      {activeTab === "cooling" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Cooling Architecture Efficiency Table */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col">
            <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Water Usage Effectiveness (WUE) Benchmarks</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Direct-to-chip liquid cooling and seawater loops achieve significantly lower L/kWh.
            </p>

            <div className="space-y-3 flex-1">
              {coolingData.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{item.avgWue} L/kWh</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-1.5">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (parseFloat(item.avgWue) / 1.5) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{item.count} Facilities ({item.capacityMW} MW IT)</span>
                    <span>Modelled: {item.waterUsageMLD} MLD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Evaporation Simulation Chart */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col">
            <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Indian Climate Seasonality & Water Evaporation Index</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              High summer ambient wet-bulb temps increase evaporative tower water loss by up to 48%.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0.7, 1.6]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val, name) => [
                      `${Math.round(val * 100)}% of baseline`,
                      name === "waterIndex" ? "Water Evaporation Factor" : "Chiller Power Factor"
                    ]}
                  />
                  <Line type="monotone" dataKey="waterIndex" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="powerDrawIndex" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span> Water Evaporation Rate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 inline-block border-b border-dashed"></span> Chiller Power Load
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI QUERY IMPACT CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="bg-slate-900/70 p-6 rounded-2xl border border-purple-500/30 shadow-2xl space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Physical Resource Cost Simulator
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              AI Compute Environmental Footprint Calculator
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Every token processed by foundation models like Gemini, Claude, or Indic LLMs engages high-density GPU racks in Indian facilities. Calculate the exact electricity, water evaporation, and carbon footprint.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl bg-slate-950/80 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                Workload Scale (Tokens Processed / Generated):
              </label>
              <span className="text-sm font-bold font-mono text-purple-400">
                {calculatorTokens.toLocaleString()} Tokens (~{Math.round(calculatorTokens / 750).toLocaleString()} words)
              </span>
            </div>

            <input
              type="range"
              min="50000"
              max="50000000"
              step="50000"
              value={calculatorTokens}
              onChange={(e) => setCalculatorTokens(Number(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => setCalculatorTokens(100000)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-950 hover:text-purple-300 text-slate-300 transition-colors"
              >
                100k (Small SaaS API)
              </button>
              <button
                onClick={() => setCalculatorTokens(1000000)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-950 hover:text-purple-300 text-slate-300 transition-colors"
              >
                1M (Enterprise Day)
              </button>
              <button
                onClick={() => setCalculatorTokens(10000000)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-950 hover:text-purple-300 text-slate-300 transition-colors"
              >
                10M (Fine-Tuning Run)
              </button>
              <button
                onClick={() => setCalculatorTokens(50000000)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-950 hover:text-purple-300 text-slate-300 transition-colors"
              >
                50M (Indic LLM Pretrain)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
                <Zap className="w-4 h-4" /> ELECTRICITY CONSUMED
              </div>
              <div className="text-2xl font-bold text-white font-mono">{calcPowerKWh} <span className="text-xs text-amber-400">kWh</span></div>
              <p className="text-[11px] text-slate-400 mt-2">
                Equivalent to running a typical 1.5-ton split AC continuously for ~{(calcPowerKWh / 1.5).toFixed(1)} hours.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
                <Droplets className="w-4 h-4" /> WATER EVAPORATED
              </div>
              <div className="text-2xl font-bold text-white font-mono">{calcWaterLiters} <span className="text-xs text-cyan-400">Liters</span></div>
              <p className="text-[11px] text-slate-400 mt-2">
                Equivalent to ~{Math.round(calcWaterLiters / 0.5)} standard 500ml drinking water bottles consumed for cooling.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-1">
                <Flame className="w-4 h-4" /> CARBON EMISSIONS
              </div>
              <div className="text-2xl font-bold text-white font-mono">{calcCarbonGrams.toLocaleString()} <span className="text-xs text-rose-400">g CO₂e</span></div>
              <p className="text-[11px] text-slate-400 mt-2">
                Based on India's CEA national grid baseline emission factor of 0.716 kg CO₂e/kWh.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

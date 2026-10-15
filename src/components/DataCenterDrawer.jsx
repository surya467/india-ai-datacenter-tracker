import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  Droplets,
  Cpu,
  Thermometer,
  ShieldCheck,
  ExternalLink,
  MapPin,
  TrendingUp,
  Leaf,
  Activity,
  AlertTriangle,
  Building2,
  Calendar,
  CloudRain,
  Wind,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { fetchLiveWeather, getEnvironmentalEquivalents } from "../services/apiService";

export default function DataCenterDrawer({ dc, onClose }) {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    if (!dc) return;
    let isMounted = true;
    setLoadingWeather(true);

    fetchLiveWeather(dc.latitude, dc.longitude)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoadingWeather(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dc]);

  if (!dc) return null;

  const itMW = dc.totalFacilityITMW || dc.itCapacityMW || 30;
  const aiMW = dc.aiDedicatedLoadMW || 0;
  const contractedPpa = dc.contractedPpaGreenPercent || dc.greenEnergyPercent || 65;
  const rtcGreen = dc.modelledRtcGreenPercent || 32;

  const equivalents = getEnvironmentalEquivalents(
    itMW,
    dc.dailyWaterLiters,
    contractedPpa,
    rtcGreen
  );

  // Dynamic calculation adjusted for live ambient temperature
  const dynamicWaterDailyLiters = weather
    ? Math.round(dc.dailyWaterLiters * weather.thermalMultiplier)
    : dc.dailyWaterLiters;

  const basePue = dc.designPue || dc.pue || 1.28;
  const dynamicOperationalPue = weather
    ? Math.round(((dc.operationalPue || 1.40) + (weather.thermalMultiplier - 1) * 0.12) * 100) / 100
    : dc.operationalPue || 1.40;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[600px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-50 flex flex-col shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/60 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              {dc.operator}
            </span>
            {dc.isIndiaAiEmpaneled && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> IndiaAI Empaneled (PIB 2026)
              </span>
            )}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                dc.operationalStatus === "Operational"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                  : dc.operationalStatus === "Expansion Phase"
                  ? "bg-blue-950 text-blue-300 border border-blue-800/60"
                  : "bg-amber-950 text-amber-300 border border-amber-800/60"
              }`}
            >
              ● {dc.operationalStatus}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {dc.tierRating}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
            {dc.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{dc.campus ? `${dc.campus}, ` : ""}{dc.city}, {dc.state}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-medium mb-1">
              <Zap className="w-3.5 h-3.5" /> TOTAL IT POWER
            </div>
            <div className="text-xl font-bold text-white font-mono">{itMW} <span className="text-xs text-slate-400">MW</span></div>
            <div className="text-[10px] text-purple-400 mt-0.5 font-mono">AI Slice: {aiMW} MW</div>
          </div>

          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-medium mb-1">
              <Droplets className="w-3.5 h-3.5" /> WATER EVAP
            </div>
            <div className="text-xl font-bold text-white font-mono">{(dynamicWaterDailyLiters / 1000000).toFixed(2)} <span className="text-xs text-slate-400">MLD</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">WUE: {dc.wue} L/kWh</div>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-medium mb-1">
              <Activity className="w-3.5 h-3.5" /> PUE RATING
            </div>
            <div className="text-xl font-bold text-white font-mono">{basePue} <span className="text-xs text-slate-400">Design</span></div>
            <div className="text-[10px] text-emerald-400/90 mt-0.5 font-mono">Oper: {dynamicOperationalPue}</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-mono font-medium mb-1">
              <Cpu className="w-3.5 h-3.5" /> AI ACCEL
            </div>
            <div className="text-xl font-bold text-white font-mono">{dc.gpuCount > 0 ? dc.gpuCount.toLocaleString() : "Colo/Cloud"}</div>
            <div className="text-[10px] text-purple-300/80 mt-0.5 font-mono">{dc.rackDensityKW} kW/rack</div>
          </div>
        </div>

        {/* Live Weather & Thermal Stress Telemetry Section */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-4 rounded-xl border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Live Environmental & Thermal Telemetry (Open-Meteo API)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {weather ? `Updated: ${weather.fetchedAt}` : "Connecting API..."}
            </span>
          </div>

          {loadingWeather ? (
            <div className="py-4 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Fetching live atmospheric conditions for {dc.city}...</span>
            </div>
          ) : weather ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Ambient Temp</div>
                  <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{weather.tempC}°C</div>
                  <div className="text-[9px] text-slate-500">Feels {weather.apparentTempC}°C</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Humidity</div>
                  <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">{weather.humidity}%</div>
                  <div className="text-[9px] text-slate-500">Wind {weather.windSpeedKmH} km/h</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Wet-Bulb Temp</div>
                  <div className="text-base font-bold text-indigo-300 font-mono mt-0.5">{weather.wetBulb}°C</div>
                  <div className="text-[9px] text-slate-500">Thermodynamic limit</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Cooling Factor</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{weather.thermalMultiplier}x</div>
                  <div className="text-[9px] text-slate-500">Live dynamic load</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200/90 flex items-start gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-300">{weather.stressLevel}: </span>
                  {weather.thermalMultiplier > 1
                    ? `Current ambient temperature (${weather.tempC}°C) in ${dc.city} increases cooling tower water evaporation rate by ~${Math.round((weather.thermalMultiplier - 1) * 100)}% over standard baseline.`
                    : `Optimal thermal envelope in ${dc.city}. Free economizer cooling active, reducing daily water evaporation footprint.`}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Weather data unavailable for this location.</div>
          )}
        </div>

        {/* SECTION 1: Electricity & Power Telemetry */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Electricity & Power Infrastructure</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                {contractedPpa}% PPA
              </span>
              <span className="text-[10px] font-mono text-teal-300 font-semibold bg-teal-950/50 px-2 py-0.5 rounded border border-teal-800/40" title="Real-time Round-The-Clock Green Power factoring solar intermittency">
                RTC: {rtcGreen}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Total Facility IT Load:</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{itMW} MW</span>
              <span className="text-[10px] text-slate-500 block">General Cloud & Enterprise</span>
            </div>
            <div>
              <span className="text-slate-400 block">Dedicated AI Compute Slice:</span>
              <span className="font-mono font-bold text-purple-300 text-sm">{aiMW} MW</span>
              <span className="text-[10px] text-slate-500 block">High-Density GPU Pods</span>
            </div>
            <div>
              <span className="text-slate-400 block">Daily Power Consumption:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{dc.dailyPowerMWh.toLocaleString()} MWh/day</span>
            </div>
            <div>
              <span className="text-slate-400 block">Facility Grid Connected Demand:</span>
              <span className="font-mono font-bold text-orange-300 text-sm">{dc.facilityPowerMW} MW Total</span>
            </div>
          </div>

          {/* Grid Source & Substation */}
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
            <div className="text-slate-400 font-mono text-[10px] uppercase">Grid Substation & Transmission</div>
            <div className="text-slate-200 font-medium">{dc.gridSubstation}</div>
          </div>

          {/* Equivalent Impact Comparison */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg text-xs space-y-1.5 text-amber-200/90">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Energy & Carbon Scale Comparison:
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              Daily power draw ({dc.dailyPowerMWh.toLocaleString()} MWh) is equivalent to continuous electricity for approximately <strong className="text-white">{equivalents.householdsPowered.toLocaleString()} Indian homes</strong>.
            </p>
            <div className="text-[11px] text-slate-300 pt-1 border-t border-amber-900/30 flex items-center justify-between">
              <span>Real Thermal Carbon (32% RTC):</span>
              <span className="font-mono font-bold text-rose-400">~{equivalents.realDailyCarbonTonnes} Tonnes CO₂e/day</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Water Consumption & Cooling Architecture */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Water Consumption & Evaporative Loss</span>
            </h3>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
              dc.waterStressIndex.includes("Critical")
                ? "bg-red-950/60 text-red-400 border-red-800/60"
                : dc.waterStressIndex.includes("High")
                ? "bg-amber-950/60 text-amber-400 border-amber-800/60"
                : "bg-cyan-950/60 text-cyan-400 border-cyan-800/60"
            }`}>
              Stress: {dc.waterStressIndex}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Daily Evaporative Loss:</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {(dynamicWaterDailyLiters / 1000000).toFixed(2)} Million Liters
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">({(dynamicWaterDailyLiters / 1000).toLocaleString()} m³/day)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Water Usage Effectiveness:</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{dc.wue} L / kWh</span>
              <span className="text-[10px] text-slate-500 block">ASHRAE TC 9.9 Modelled</span>
            </div>
          </div>

          {/* Cooling Tech & Water Source */}
          <div className="space-y-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Cooling Architecture</div>
              <div className="text-slate-200 font-semibold mt-0.5">{dc.coolingType}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-mono text-[10px] uppercase">Water Source & Circularity</div>
              <div className="text-slate-200 font-medium mt-0.5">{dc.waterSource}</div>
            </div>
          </div>

          {/* Water Footprint Equivalent */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg text-xs space-y-1.5 text-cyan-200/90">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" /> Civic Benchmark (BIS 135 LPCD Standard):
            </div>
            <p className="text-[11px] leading-relaxed text-cyan-200/80">
              Equivalent to the domestic water needs of ~<strong className="text-white">{equivalents.peopleDailyDomesticWater.toLocaleString()} citizens</strong>, or drinking water for <strong className="text-white">{equivalents.peopleDrinkingWater.toLocaleString()} people</strong>.
            </p>
          </div>
        </div>

        {/* SECTION 3: AI Compute Fleet & Hardware */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-purple-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI Compute Fleet & Hardware Architecture</span>
            </h3>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
              {dc.rackDensityKW} kW/rack Density
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-mono text-[10px] uppercase">GPU Accelerators & Superclusters</div>
              <div className="text-purple-300 font-mono font-medium text-sm mt-0.5">{dc.aiHardware}</div>
              {dc.isIndiaAiEmpaneled && (
                <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                  ✓ Empaneled under Government IndiaAI Mission (PIB March 2026) at ₹65/hr subsidized rates.
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 font-mono text-[10px] uppercase mb-1">Key AI Workloads & Workstreams</div>
              <div className="flex flex-wrap gap-1.5">
                {dc.keyWorkloads?.map((w, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 text-[10px] border border-purple-800/40 font-mono">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Verified Citation & Capital */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Capital & Verified Citation</span>
            </h3>
            <span className="font-mono text-amber-400 font-bold text-xs">
              ₹{dc.investmentCrores?.toLocaleString()} Cr Investment
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            {dc.description}
          </p>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="text-cyan-400 font-mono font-semibold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Official Verification Source:
            </div>
            <div className="text-slate-300">{dc.officialCitation}</div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Commissioned: {dc.yearCommissioned}
            </span>
            <a
              href={dc.operatorWebsite}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Operator Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

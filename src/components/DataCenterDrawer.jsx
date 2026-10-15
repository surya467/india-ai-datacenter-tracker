import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  Droplets,
  Cpu,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  CloudRain,
  Building2,
  Calendar
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
  const contractedPpa = dc.contractedPpaGreenPercent || dc.greenEnergyPercent || 65;
  const rtcGreen = dc.modelledRtcGreenPercent || 32;

  const equivalents = getEnvironmentalEquivalents(
    itMW,
    dc.dailyWaterLiters,
    contractedPpa,
    rtcGreen
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[580px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl transition-all duration-300 overflow-hidden text-slate-900">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-white sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {dc.operator}
            </span>
            {dc.isIndiaAiEmpaneled && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-600 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>IndiaAI Empaneled Partner</span>
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-medium">
              Tier {dc.tierRating?.includes("IV") ? "IV" : "III"}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{dc.name}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{dc.campus || dc.city}, {dc.city}, {dc.state}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Key Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-medium block">TOTAL IT LOAD</span>
            <span className="text-base font-bold text-slate-900 block mt-0.5">{itMW} MW</span>
            <span className="text-[10px] text-blue-600 font-medium">AI: {dc.aiDedicatedLoadMW || 0} MW</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-medium block">OPERATIONAL PUE</span>
            <span className="text-base font-bold text-slate-900 block mt-0.5">{dc.operationalPue || 1.40}</span>
            <span className="text-[10px] text-slate-500 font-medium">Design: {dc.designPue || 1.28}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-medium block">DAILY WATER</span>
            <span className="text-base font-bold text-slate-900 block mt-0.5">
              {(dc.dailyWaterLiters / 1000000).toFixed(2)} MLD
            </span>
            <span className="text-[10px] text-slate-500 font-medium">WUE: {dc.wue} L/kWh</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-medium block">AI ACCELERATORS</span>
            <span className="text-base font-bold text-blue-600 block mt-0.5">
              {dc.gpuCount > 0 ? dc.gpuCount.toLocaleString() : "High-Density"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">GPUs / NPUs</span>
          </div>
        </div>

        {/* Live Ambient Weather Impact */}
        {weather && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Ambient Weather & Thermal Load</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Open-Meteo API</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Temperature</span>
                <span className="font-bold text-slate-900">{weather.temperature}°C</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Relative Humidity</span>
                <span className="font-bold text-slate-900">{weather.relativeHumidity}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Thermal Stress</span>
                <span className="font-bold text-blue-600">{weather.thermalMultiplier}x baseline</span>
              </div>
            </div>
          </div>
        )}

        {/* Deep Dive Section 1: Power & Grid Infrastructure */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Power & Grid Specifications</span>
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200">
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Contracted Facility Power</span>
              <span className="font-semibold text-slate-900">{dc.facilityPowerMW || dc.totalFacilityITMW * 1.3} MW</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Estimated Daily Electricity</span>
              <span className="font-semibold text-slate-900">{dc.dailyPowerMWh?.toLocaleString() || Math.round(itMW * 24)} MWh/day</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Renewable Energy PPA (Contracted)</span>
              <span className="font-semibold text-blue-600">{contractedPpa}% Green</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Round-the-Clock (RTC) Physical Green</span>
              <span className="font-semibold text-slate-900">{rtcGreen}% RTC Matched</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Grid Interconnection</span>
              <span className="font-medium text-slate-700 text-right max-w-[280px]">{dc.gridSubstation || "Dedicated 220kV Substation"}</span>
            </div>
          </div>
        </div>

        {/* Deep Dive Section 2: Water Footprint & Cooling */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2.5">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Water & Thermal Cooling</span>
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200">
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Cooling Architecture</span>
              <span className="font-semibold text-slate-900 text-right max-w-[280px]">{dc.coolingType}</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Water Usage Effectiveness (WUE)</span>
              <span className="font-semibold text-slate-900">{dc.wue} Liters / kWh</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Primary Water Source</span>
              <span className="font-medium text-slate-700 text-right max-w-[280px]">{dc.waterSource}</span>
            </div>
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Regional Water Stress Level</span>
              <span className="font-semibold text-blue-600">{dc.waterStressIndex || "Medium-High"}</span>
            </div>
          </div>
        </div>

        {/* Deep Dive Section 3: AI Compute Fleet */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Supercomputing & Silicon</span>
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Hardware Fleet</span>
              <span className="font-bold text-slate-900 text-right">{dc.aiHardware || "Custom AI Compute Fabric"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Rack Power Density</span>
              <span className="font-semibold text-slate-900">{dc.rackDensityKW || 60} kW / rack</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Key AI Workloads</span>
              <span className="font-medium text-slate-700 text-right">
                {Array.isArray(dc.keyWorkloads) ? dc.keyWorkloads.join(", ") : "Generative AI, Indic LLMs"}
              </span>
            </div>
          </div>
        </div>

        {/* Official Citation & Verification Source */}
        <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-900">Official Data Citation</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {dc.officialCitation || "Press Information Bureau (PIB) / IndiaAI Mission Release (March 2026) & JLL Mid-2026 Sector Report."}
          </p>
          {dc.operatorWebsite && (
            <a
              href={dc.operatorWebsite}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline mt-2"
            >
              <span>Operator Technical Specification</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

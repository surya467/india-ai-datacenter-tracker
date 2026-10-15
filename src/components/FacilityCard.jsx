import React from "react";
import { Zap, Droplets, MapPin, ArrowRight } from "lucide-react";

export default function FacilityCard({ dc, isSelected, onSelect }) {
  const itMW = dc.totalFacilityITMW || dc.itCapacityMW;

  return (
    <div
      onClick={() => onSelect(dc)}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden text-left bg-white ${
        isSelected
          ? "border-blue-600 ring-2 ring-blue-600/20 shadow-sm"
          : "border-slate-200 hover:border-blue-600 hover:shadow-xs"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 truncate max-w-[150px]">
            {dc.operator}
          </span>
          {dc.isIndiaAiEmpaneled && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
              title="Empaneled under Government IndiaAI Mission (PIB March 2026)"
            >
              IndiaAI
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
          <span>PUE {dc.designPue || dc.pue}</span>
          <span className="text-slate-300">•</span>
          <span>{dc.contractedPpaGreenPercent || dc.greenEnergyPercent}% PPA</span>
        </div>
      </div>

      {/* Facility Name & Location */}
      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
        {dc.name}
      </h4>
      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
        <span className="truncate">{dc.city}, {dc.state}</span>
      </p>

      {/* Resource Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-400 block font-medium">TOTAL IT LOAD</span>
            <span className="font-bold text-slate-900">{itMW} MW</span>
            {dc.aiDedicatedLoadMW > 0 && (
              <span className="text-[9px] text-blue-600 block font-medium">(AI: {dc.aiDedicatedLoadMW} MW)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-400 block font-medium">WATER EVAPORATION</span>
            <span className="font-bold text-slate-900">{(dc.dailyWaterLiters / 1000000).toFixed(2)} MLD</span>
            <span className="text-[9px] text-slate-500 block">WUE: {dc.wue} L/kWh</span>
          </div>
        </div>
      </div>

      {/* Hardware Fleet & Action */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] bg-slate-50 px-2.5 py-1 rounded border border-slate-150">
        <span className="truncate max-w-[200px] text-slate-700 font-medium">
          {dc.gpuCount > 0 ? `${dc.gpuCount.toLocaleString()} GPUs` : dc.aiHardware?.split("+")[0] || "AI Cluster"}
        </span>
        <span className="text-blue-600 font-semibold flex items-center gap-0.5 hover:underline shrink-0">
          Profile &rarr;
        </span>
      </div>
    </div>
  );
}

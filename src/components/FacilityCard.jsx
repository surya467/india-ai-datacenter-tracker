import React from "react";
import { Zap, Droplets, Cpu, MapPin, Activity, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function FacilityCard({ dc, isSelected, onSelect }) {
  const itMW = dc.totalFacilityITMW || dc.itCapacityMW;
  const isHighPower = itMW >= 60;
  const isLiquid = dc.coolingType.toLowerCase().includes("liquid") || dc.coolingType.toLowerCase().includes("immersion");

  return (
    <div
      onClick={() => onSelect(dc)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden text-left ${
        isSelected
          ? "bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50"
          : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Top Tag Line */}
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 truncate max-w-[150px]">
            {dc.operator}
          </span>
          {dc.isIndiaAiEmpaneled && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60" title="Empaneled under Government IndiaAI Mission (PIB March 2026)">
              IndiaAI
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-emerald-400 font-semibold">PUE {dc.designPue || dc.pue}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{dc.contractedPpaGreenPercent || dc.greenEnergyPercent}% PPA</span>
        </div>
      </div>

      {/* Facility Name & City */}
      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
        {dc.name}
      </h4>
      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
        <span className="truncate">{dc.city}, {dc.state}</span>
      </p>

      {/* Resource Badges */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 block">TOTAL IT LOAD</span>
            <span className="font-bold text-amber-300">{itMW} MW</span>
            {dc.aiDedicatedLoadMW > 0 && (
              <span className="text-[9px] text-purple-400 block font-normal">(AI: {dc.aiDedicatedLoadMW} MW)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 block">WATER EVAPORATION</span>
            <span className="font-bold text-cyan-300">{(dc.dailyWaterLiters / 1000000).toFixed(2)} MLD</span>
            <span className="text-[9px] text-slate-400 block font-normal">WUE: {dc.wue} L/kWh</span>
          </div>
        </div>
      </div>

      {/* Hardware pill */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60">
        <span className="truncate max-w-[190px] text-purple-300 font-mono">
          {dc.gpuCount > 0 ? `${dc.gpuCount.toLocaleString()} GPUs` : dc.aiHardware?.split("+")[0] || "High-Density AI Cluster"}
        </span>
        <span className="text-cyan-400 font-mono font-medium flex items-center gap-0.5 hover:underline shrink-0">
          Details &rarr;
        </span>
      </div>
    </div>
  );
}

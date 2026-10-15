import React, { useState } from "react";
import { X, Globe, Radio, Database, Copy, Check, ExternalLink } from "lucide-react";

export default function ApiHubModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apis = [
    {
      title: "Open-Meteo Live Atmospheric & Thermal API",
      category: "Free Public API (No Key Required)",
      url: "https://api.open-meteo.com/v1/forecast",
      description:
        "Fetches real-time dry-bulb ambient temperature, relative humidity, and thermodynamic wet-bulb limits for each Indian data center coordinate. This calculates real-time chiller coefficient of performance (COP) and hourly water evaporation loss.",
      curlExample:
        'curl "https://api.open-meteo.com/v1/forecast?latitude=18.9894&longitude=73.1175&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m"',
      docUrl: "https://open-meteo.com/en/docs"
    },
    {
      title: "OpenStreetMap (OSM) Overpass API - Geospatial Infrastructure",
      category: "Global Open Geospatial API",
      url: "https://overpass-api.de/api/interpreter",
      description:
        "Queries live open geospatial infrastructure across India tagged with telecom=data_center, building=data_center, or industrial=data_center bounded strictly to India.",
      curlExample: `curl -d 'data=[out:json][timeout:25];(node["telecom"="data_center"](6.2,68.0,37.4,97.6);way["telecom"="data_center"](6.2,68.0,37.4,97.6););out center 50;' https://overpass-api.de/api/interpreter`,
      docUrl: "https://wiki.openstreetmap.org/wiki/Overpass_API"
    },
    {
      title: "Central Electricity Authority (CEA) India - Grid Emission Factor",
      category: "Official Regulatory Baseline",
      url: "https://cea.nic.in",
      description:
        "Central Electricity Authority, Ministry of Power, Government of India. Provides the national grid baseline emission factor: 0.716 kg CO₂e per kWh (Version 19 / 2024 update), used to compute the carbon footprint of non-renewable power consumption.",
      curlExample: "Grid Baseline Emission Factor: 0.716 kg CO2e / kWh (CEA National Registry)",
      docUrl: "https://cea.nic.in/cdm-co2-baseline-database/?lang=en"
    },
    {
      title: "Press Information Bureau (PIB) / IndiaAI Mission Compute Releases",
      category: "Official Government Verification",
      url: "https://pib.gov.in",
      description:
        "Government of India Press Information Bureau releases confirming 38,231 high-performance GPUs onboarded under the IndiaAI Mission as of March 2026 across 14 empaneled vendors at ₹65/GPU/hr subsidized rates, and national installed operational capacity scaling to ~1,575 MW.",
      curlExample: "PIB Release ID: IndiaAI Compute Infrastructure Onboarding (March 2026)",
      docUrl: "https://pib.gov.in"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#10121a] border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#131520]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm text-white">
                Live Data APIs & Verified Government Sources
              </h3>
              <p className="text-[11px] text-zinc-400">
                Official baselines, curl snippets, and open endpoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300 text-[11px] leading-relaxed">
            <strong>Data Accuracy Commitment:</strong> This platform grounds all metrics in verified official sources: the 1,575 MW total capacity and 38,231 GPU fleet derive from Press Information Bureau (PIB) IndiaAI Mission releases and JLL/CBRE mid-2026 reports. Live thermal stress and cooling evaporation multipliers are calculated via Open-Meteo's open atmospheric API.
          </div>

          {apis.map((api, idx) => (
            <div key={idx} className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {api.category}
                  </span>
                  <h4 className="font-semibold text-xs text-white mt-1.5">{api.title}</h4>
                </div>

                <a
                  href={api.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {api.description}
              </p>

              {/* Code Box */}
              <div className="relative bg-[#090a0f] p-2 rounded border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                <code>{api.curlExample}</code>
                <button
                  onClick={() => copyToClipboard(api.curlExample, idx)}
                  className="absolute right-1.5 top-1.5 p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  title="Copy command"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#131520] flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">
            No private API keys required
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

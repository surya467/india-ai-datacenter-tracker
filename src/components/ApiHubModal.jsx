import React, { useState } from "react";
import { X, Globe, BookOpen, Copy, Check, ExternalLink } from "lucide-react";

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
      title: "Press Information Bureau (PIB) / IndiaAI Mission Verification",
      category: "Official Government Verification",
      url: "https://pib.gov.in",
      description:
        "Ministry of Electronics and Information Technology (MeitY) & Press Information Bureau official releases establishing 38,231 high-performance GPUs onboarded under the IndiaAI Mission compute pillar as of March 2026 across empaneled cloud service providers, and operational Indian DC capacity calibrated at 1,575 MW.",
      curlExample: "PIB Reference: IndiaAI Compute Infrastructure Empanelment (March 2026)",
      docUrl: "https://pib.gov.in"
    },
    {
      title: "Open-Meteo Atmospheric & Thermodynamics API",
      category: "Live Free Public API (No Key Required)",
      url: "https://api.open-meteo.com/v1/forecast",
      description:
        "Fetches live ambient dry-bulb temperature and relative humidity for Indian data center clusters, dynamically modelling chiller cooling loads and hourly evaporative water demand.",
      curlExample:
        'curl "https://api.open-meteo.com/v1/forecast?latitude=18.9894&longitude=73.1175&current=temperature_2m,relative_humidity_2m"',
      docUrl: "https://open-meteo.com/en/docs"
    },
    {
      title: "Central Electricity Authority (CEA) CO₂ Baseline Database",
      category: "Official Regulatory Baseline",
      url: "https://cea.nic.in",
      description:
        "Central Electricity Authority, Ministry of Power, Government of India. Establishes the national grid emission factor of 0.716 kg CO₂e per kWh (v19 update), tracking thermal coal vs renewable PPA offsets.",
      curlExample: "Grid Baseline Emission Factor: 0.716 kg CO2e / kWh (CEA National Database)",
      docUrl: "https://cea.nic.in/cdm-co2-baseline-database/?lang=en"
    },
    {
      title: "Ministry of Jal Shakti & The Green Grid (WUE Model)",
      category: "Environmental Framework",
      url: "https://jalshakti-dowr.gov.in",
      description:
        "Calculates water footprint based on The Green Grid Water Usage Effectiveness (WUE) standards and ASHRAE TC 9.9 thermal envelope guidelines for tropical data center operations.",
      curlExample: "WUE Formula: Annual Water Consumption (Liters) / IT Equipment Energy (kWh)",
      docUrl: "https://www.thegreengrid.org"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Data Verification Sources & Methodology
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Government of India releases, atmospheric APIs & environmental standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {apis.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {item.category}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.description}
              </p>

              <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between gap-2 font-mono text-[10px] text-slate-700">
                <span className="truncate">{item.curlExample}</span>
                <button
                  onClick={() => copyToClipboard(item.curlExample, idx)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <a
                  href={item.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Official Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>All tracking metrics calibrated as of Mid-2026.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

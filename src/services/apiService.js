// API Service for Live Telemetry, Weather, OSM Overpass, and Carbon/Water Calculations

// Stull's empirical formula for wet-bulb temperature from dry-bulb (T in °C) and RH (%)
export function calculateWetBulb(temperatureC, relativeHumidity) {
  const T = temperatureC;
  const RH = relativeHumidity;
  const Tw =
    T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;
  return Math.round(Tw * 10) / 10;
}

// Calculate real-time cooling efficiency multiplier based on ambient heat
export function calculateThermalStress(tempC, humidity) {
  const wetBulb = calculateWetBulb(tempC, humidity);
  // Baseline design wet bulb for Indian data center chillers is ~24°C
  // When wet-bulb exceeds 26°C, cooling towers must evaporate significantly more water
  let multiplier = 1.0;
  if (wetBulb > 24) {
    multiplier = 1.0 + (wetBulb - 24) * 0.045; // ~4.5% extra cooling power & water per deg above 24C
  } else if (wetBulb < 20) {
    multiplier = Math.max(0.75, 1.0 - (20 - wetBulb) * 0.03); // Economizer mode active
  }
  return {
    wetBulb,
    multiplier: Math.round(multiplier * 100) / 100,
    economizerActive: wetBulb < 20,
    stressLevel: wetBulb > 28 ? "Extreme Thermal Load" : wetBulb > 25 ? "Elevated Evaporation" : "Optimal Conditions"
  };
}

// Cache for weather to avoid hitting Open-Meteo excessively
const weatherCache = new Map();

// Fetch live weather from Open-Meteo API
export async function fetchLiveWeather(latitude, longitude) {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();
    const current = data.current;
    const thermal = calculateThermalStress(current.temperature_2m, current.relative_humidity_2m);

    const result = {
      tempC: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      apparentTempC: current.apparent_temperature,
      windSpeedKmH: current.wind_speed_10m,
      rainMm: current.precipitation,
      wetBulb: thermal.wetBulb,
      thermalMultiplier: thermal.multiplier,
      economizerActive: thermal.economizerActive,
      stressLevel: thermal.stressLevel,
      fetchedAt: new Date().toLocaleTimeString("en-IN")
    };

    weatherCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn("Failed to fetch live weather, using estimated baseline:", err);
    return {
      tempC: 32.5,
      humidity: 55,
      apparentTempC: 36.0,
      windSpeedKmH: 12,
      rainMm: 0,
      wetBulb: 24.8,
      thermalMultiplier: 1.04,
      economizerActive: false,
      stressLevel: "Estimated Seasonal Average",
      fetchedAt: "Fallback Estimate"
    };
  }
}

// Fetch live Data Center nodes across India via OpenStreetMap Overpass API
export async function fetchOverpassDataCenters() {
  const query = `
    [out:json][timeout:25];
    (
      node["telecom"="data_center"](8.0,68.0,36.0,97.0);
      way["telecom"="data_center"](8.0,68.0,36.0,97.0);
      node["building"="data_center"](8.0,68.0,36.0,97.0);
      way["building"="data_center"](8.0,68.0,36.0,97.0);
    );
    out center 50;
  `;

  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error(`Overpass API responded with status ${res.status}`);
    const data = await res.json();

    const elements = data.elements || [];
    return elements.map((el) => {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      const tags = el.tags || {};
      return {
        id: `osm-${el.id}`,
        name: tags.name || tags["name:en"] || tags.operator || `OSM Data Center #${el.id}`,
        operator: tags.operator || tags.brand || "Independent / Listed on OSM",
        city: tags["addr:city"] || tags["addr:suburb"] || "India",
        state: tags["addr:state"] || "India",
        latitude: lat,
        longitude: lon,
        osmTags: tags,
        source: "OpenStreetMap Live Overpass Feed",
        isLiveOsmNode: true
      };
    }).filter(item => item.latitude && item.longitude);
  } catch (err) {
    console.error("Overpass query failed:", err);
    throw err;
  }
}

// CEA India & Environmental Equivalencies
export const CEA_GRID_EMISSION_FACTOR = 0.716; // kg CO2e per kWh (Central Electricity Authority Baseline Database v19)
export const LPCD_BENCHMARK = 135; // Liters per capita per day (Indian standard domestic urban consumption)
export const HOUSEHOLD_DAILY_KWH = 3.2; // Average daily electricity usage per Indian household

export function getEnvironmentalEquivalents(itCapacityMW, dailyWaterLiters, contractedPpaGreen = 65, modelledRtcGreen = 32) {
  const dailyKWh = (itCapacityMW || 0) * 1000 * 24;

  // Real physical RTC carbon (actual thermal grid draw)
  const realThermalKWh = dailyKWh * (1 - (modelledRtcGreen || 32) / 100);
  const realDailyCarbonKg = realThermalKWh * CEA_GRID_EMISSION_FACTOR;
  const realDailyCarbonTonnes = Math.round(realDailyCarbonKg / 1000);
  const realAnnualCarbonTonnes = Math.round(realDailyCarbonTonnes * 365);

  // Nominal Paper PPA Carbon (if counting annual solar/wind offsets)
  const nominalNonGreenKWh = dailyKWh * (1 - (contractedPpaGreen || 65) / 100);
  const nominalDailyCarbonKg = nominalNonGreenKWh * CEA_GRID_EMISSION_FACTOR;
  const nominalDailyCarbonTonnes = Math.round(nominalDailyCarbonKg / 1000);

  const householdsPowered = Math.round(dailyKWh / HOUSEHOLD_DAILY_KWH);
  const peopleDailyDomesticWater = Math.round((dailyWaterLiters || 0) / LPCD_BENCHMARK);
  const peopleDrinkingWater = Math.round((dailyWaterLiters || 0) / 2.5);

  return {
    realDailyCarbonTonnes,
    realAnnualCarbonTonnes,
    nominalDailyCarbonTonnes,
    householdsPowered,
    peopleDailyDomesticWater,
    peopleDrinkingWater
  };
}

// Export Catalog to GeoJSON
export function exportToGeoJSON(dataCenters) {
  const geojson = {
    type: "FeatureCollection",
    metadata: {
      source: "Bharat AI Infra Tracker",
      scope: "India Data Center Capacity & Resource Metrics (Mid-2026)",
      citations: [
        "Press Information Bureau (PIB) / IndiaAI Mission (March 2026): 38,231 GPUs onboarded",
        "PIB / JLL / CBRE (Mid-2026): 1,575 MW total national operational DC capacity",
        "Central Electricity Authority (CEA) Baseline v19: 0.716 kg CO2e/kWh"
      ]
    },
    features: dataCenters.map((dc) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [dc.longitude, dc.latitude]
      },
      properties: {
        id: dc.id,
        name: dc.name,
        operator: dc.operator,
        city: dc.city,
        state: dc.state,
        totalFacilityITMW: dc.totalFacilityITMW || dc.itCapacityMW,
        aiDedicatedLoadMW: dc.aiDedicatedLoadMW || 0,
        designPue: dc.designPue || dc.pue,
        operationalPue: dc.operationalPue || 1.40,
        wue: dc.wue,
        dailyWaterLiters: dc.dailyWaterLiters,
        coolingType: dc.coolingType,
        aiHardware: dc.aiHardware,
        gpuCount: dc.gpuCount || 0,
        isIndiaAiEmpaneled: !!dc.isIndiaAiEmpaneled,
        contractedPpaGreenPercent: dc.contractedPpaGreenPercent || dc.greenEnergyPercent || 0,
        modelledRtcGreenPercent: dc.modelledRtcGreenPercent || 32,
        status: dc.operationalStatus,
        officialCitation: dc.officialCitation || "Industry Filings & Reports"
      }
    }))
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `india_ai_data_centers_calibrated_${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export Catalog to CSV
export function exportToCSV(dataCenters) {
  const headers = [
    "ID", "Name", "Operator", "Campus", "City", "State", "Latitude", "Longitude",
    "Total IT Capacity (MW)", "AI Dedicated Load (MW)", "Facility Power (MW)", "Daily Power (MWh)",
    "Design PUE", "Operational PUE (Tropical)", "Daily Water Evaporation (Liters)", "WUE (L/kWh)",
    "Cooling Technology", "Water Source", "Water Stress Index", "AI Hardware", "GPU Count",
    "IndiaAI Empaneled", "Rack Density (kW)", "Contracted PPA Green (%)", "Modelled RTC Green (%)",
    "Tier Rating", "Status", "Investment (INR Cr)", "Official Citation"
  ];

  const rows = dataCenters.map(dc => [
    `"${dc.id}"`,
    `"${dc.name}"`,
    `"${dc.operator}"`,
    `"${dc.campus || ''}"`,
    `"${dc.city}"`,
    `"${dc.state}"`,
    dc.latitude,
    dc.longitude,
    dc.totalFacilityITMW || dc.itCapacityMW,
    dc.aiDedicatedLoadMW || 0,
    dc.facilityPowerMW,
    dc.dailyPowerMWh,
    dc.designPue || dc.pue,
    dc.operationalPue || 1.40,
    dc.dailyWaterLiters,
    dc.wue,
    `"${dc.coolingType}"`,
    `"${dc.waterSource}"`,
    `"${dc.waterStressIndex}"`,
    `"${dc.aiHardware || ''}"`,
    dc.gpuCount || 0,
    dc.isIndiaAiEmpaneled ? "Yes (PIB Verified)" : "No (Private/Enterprise)",
    dc.rackDensityKW || 0,
    dc.contractedPpaGreenPercent || dc.greenEnergyPercent || 0,
    dc.modelledRtcGreenPercent || 32,
    `"${dc.tierRating}"`,
    `"${dc.operationalStatus}"`,
    dc.investmentCrores || 0,
    `"${dc.officialCitation || ''}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `india_ai_datacenters_verified_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

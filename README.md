# 🇮🇳 India AI Data Center & Environmental Telemetry Tracker

An interactive geospatial mapping and telemetry platform tracking Artificial Intelligence (AI) and hyperscale data center infrastructure across India. Built with clean, minimalist design principles, focusing on physical computing constraints: **Electricity Demand (MW/MWh)**, **Evaporative Water Consumption (MLD/WUE)**, **IndiaAI Mission GPU Fleets**, and **Real-Time Atmospheric Cooling Efficiency**.

---

## ⚡ Key Highlights & Calibrated Baselines

All metrics are calibrated against verified official government filings and industry property reviews:

* **1,575 MW Total Operational IT Stock:** India's entire operational data center footprint across enterprise cloud, BFSI, DPI, and AI (*Press Information Bureau & JLL/CBRE Mid-2026 Reports*).
* **~372 MW Dedicated AI Load:** Active high-density AI clusters (40–120 kW per rack) running LLM pre-training, fine-tuning, and inference.
* **38,231 Verified IndiaAI Mission GPUs:** High-performance GPUs empaneled under the Ministry of Electronics & IT (MeitY) IndiaAI Compute Portal (*PIB Release, March 2026*) accessible at subsidized ₹65/hr rates.
* **25.7 MLD Modelled Evaporative Water Loss:** Direct on-site cooling tower water evaporation calculated according to **ASHRAE TC 9.9 & The Green Grid Water Usage Effectiveness (WUE)** standards (~68% sourced from treated sewage STP/TTRO or seawater).
* **Dual PUE & Green Metrics:** Discloses **1.28 Design PUE vs. 1.40 Climatic Operational PUE**, and **71% Contracted Annual Renewable PPAs vs. 34% Real-Time Round-The-Clock (RTC) Green Power** accounting for night-time coal grid dependency.
* **Live Atmospheric Thermal Telemetry:** Dynamic dry-bulb and wet-bulb calculations fetched in real-time via the free open **Open-Meteo API**.
* **Strict India Boundary Lock:** Map viewport is locked strictly to India with custom minimal tiles (CartoDB Positron & Dark Matter).

---

## 🚀 How to Host on GitHub Pages (Public Viewing)

The repository is already configured with `base: './'` in `vite.config.js` and contains an automated GitHub Actions deployment workflow.

### Option A: Automated GitHub Actions (Recommended)

1. **Create a new repository** on your GitHub account (e.g., `india-ai-datacenter-tracker`).
2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for India AI Data Center Tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/india-ai-datacenter-tracker.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Navigate to **Settings** → **Pages** (under "Code and automation").
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. That's it! GitHub will automatically run the workflow in `.github/workflows/deploy.yml` and publish your site at:
   ```
   https://<your-username>.github.io/india-ai-datacenter-tracker/
   ```

---

### Option B: 1-Click CLI Deployment (`gh-pages`)

If you prefer deploying via the `gh-pages` npm package:

1. Push your repo to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/india-ai-datacenter-tracker.git
   git push -u origin main
   ```
2. Run the deploy script:
   ```bash
   npm run deploy
   ```
3. In your GitHub repo's **Settings** → **Pages**, select the `gh-pages` branch as the source.

---

## 💻 Local Development

To run the application locally:

```bash
# Clone the repository
git clone https://github.com/<your-username>/india-ai-datacenter-tracker.git

# Enter project directory
cd india-ai-datacenter-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📊 Data Verification & Sources

1. **Press Information Bureau (PIB):** Government of India releases on the IndiaAI Mission (38,231 GPUs onboarded) and national operational data center milestones (~1,575 MW).
2. **Central Electricity Authority (CEA):** Version 19 CO₂ Baseline Database for the Indian Power Sector (0.716 kg CO₂e / kWh).
3. **Open-Meteo API:** Open-access atmospheric thermal telemetry (`https://api.open-meteo.com/v1/forecast`).
4. **OpenStreetMap Overpass API:** Public geospatial queries for Indian telecommunications infrastructure (`https://overpass-api.de/api/interpreter`).
5. **JLL & CBRE Research:** India Data Center Market Dynamics & Real Estate Reviews.

---

## 📄 License

MIT License. Open for researchers, policy analysts, and clean energy advocates.

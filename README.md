# Sentinel-2 NDVI Time Series Inspector (Google Earth Engine)

Interactive Google Earth Engine (GEE) app for exploring **Normalized Difference Vegetation Index (NDVI)** over time.  
Click anywhere on the map to view a point-based NDVI time series and inspect a recent **max-NDVI composite**.

> **Provenance**: Modified from Google Earth Engine’s example **“MODIS Ocean Temperature – Time Series Inspector.”**  
> The code in this repository is licensed under **Apache License 2.0**.

---

## Features

- **Map composite (recent)**: Maximum NDVI over the last 6 months (configurable).
- **Point time series (historic)**: Sentinel-2 NDVI from **2018-01-01 → today** (configurable).
- **On-click inspection**: Click to chart NDVI at any location.
- **Legend + coordinates**: Inline legend and lon/lat readout.
- **Cloud/scene masking**: Uses Sentinel-2 **SCL** (Scene Classification Layer) based mask.  

![Screenshot](docs/screenshot.png) <!-- Replace with a real image or remove this line -->

---

## Quick start

1. **Requirements**
   - Approved access to **Google Earth Engine** (https://earthengine.google.com).
   - Modern web browser.

2. **Run in the Code Editor**
   - Open the **GEE Code Editor** at https://code.earthengine.google.com/
   - Create a new script and paste the contents of `ee/ndvi_inspector.js`.
   - Click **Run** and authorize if prompted.

3. **Initial view**
   - The map centers on a sample point (Skåne County, Sweden). Click anywhere to generate a chart.

---

## How it works

- **Data**: `COPERNICUS/S2_SR_HARMONIZED` (Sentinel-2 Surface Reflectance, harmonized).
- **NDVI band**: Computed as `normalizedDifference(['B8', 'B4'])` and added to each image.
- **Composite**: `.select('NDVI').max()` over the last **6 months** (default).
- **Time series**: All available images from **2018-01-01** to the current date.
- **Masking**: Keeps SCL classes {4: Vegetation, 5: Bare soil, 6: Water, 7: Cloud low-probability}.  
  Adjust to your use case (e.g., exclude water or tighten cloud filtering).

---


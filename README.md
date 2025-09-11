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




/*
 * Copyright 2025 Zhanzhang Cai
 * Author: Zhanzhang Cai
 * Email: zhanzhang.cai@nateko.lu.se
 * Date: 2024-01-24
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Provenance: Modified from the Google Earth Engine example
 * “MODIS Ocean Temperature – Time Series Inspector” (Apache-2.0).
 */

// Sentinel-2 NDVI Time Series Inspector

/**** Map layer configuration ****/

// Current date and a look-back window for the composite.
var currentDate = ee.Date(Date.now());
// Note: despite the original comment, this is a six-month window.
var sixMonthsBefore = currentDate.advance(-6, 'month');

// Build collections:
// 1) cimap: recent period used to create a map composite (max NDVI over last 6 months).
// 2) cits: long time series used to chart NDVI at a clicked point (2018 → today).
var cimap = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate(sixMonthsBefore, currentDate)
  .map(maskS2clouds);

var cits = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2018-01-01', currentDate)
  .map(maskS2clouds);

// NDVI visualization parameters (range −0.2 … 1).
var vis = {min: 0.2, max: 1, palette: ['white', 'green', 'black']};

// Map composite: maximum NDVI over the recent window.
var composite = cimap.select('NDVI').max().visualize(vis);
var compositeLayer = ui.Map.Layer(composite).setName('NDVI Composite');

// Create the main map and add the composite layer.
var mapPanel = ui.Map();
var layers = mapPanel.layers();
layers.add(compositeLayer, 'NDVI Composite');

/**** Panel setup ****/

// Right-hand panel to show title, coordinates, chart, and legend.
var inspectorPanel = ui.Panel({style: {width: '30%'}});

// Title and instructions.
var intro = ui.Panel([
  ui.Label({
    value: 'Sentinel-2 Vegetation Index — Time Series Inspector',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
  ui.Label('Click anywhere on the map to view a point NDVI time series.')
]);
inspectorPanel.add(intro);

// Coordinate readout.
var lon = ui.Label();
var lat = ui.Label();
inspectorPanel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Placeholders for chart and legend (slots 2 and 3).
inspectorPanel.add(ui.Label('[Chart]'));
inspectorPanel.add(ui.Label('[Legend]'));

/**** Chart setup ****/

// Generate a new NDVI time-series chart for the clicked coordinates.
var generateChart = function (coords) {
  // Update lon/lat labels.
  lon.setValue('lon: ' + coords.lon.toFixed(6));
  lat.setValue('lat: ' + coords.lat.toFixed(6));

  // Add a dot at the clicked point (as layer index 1 so it draws above the composite).
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var dot = ui.Map.Layer(point, {color: '000000'}, 'clicked location');
  mapPanel.layers().set(1, dot);

  // Make a chart from the time series.
  var ndviChart = ui.Chart.image.series(cits.select(['NDVI']), point);

  // Chart styling.
  ndviChart.setOptions({
    title: 'Vegetation Index: time series',
    vAxis: {title: 'NDVI'},
    hAxis: {title: 'Date', format: 'MM-yy', gridlines: {count: 7}},
    series: {
      0: {
        color: 'blue',
        lineWidth: 0,
        pointsVisible: true,
        pointSize: 2
      }
    },
    legend: {position: 'right'}
  });

  // Insert the chart at a fixed position so new clicks overwrite the previous chart.
  inspectorPanel.widgets().set(2, ndviChart);
};

/**** Legend setup ****/

// Helper to create a horizontal color bar from a palette.
function makeColorBarParams(palette) {
  return {
    bbox: [0, 0, 1, 0.1],
    dimensions: '100x10',
    format: 'png',
    min: 0,
    max: 1,
    palette: palette
  };
}

// Color bar thumbnail.
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0),
  params: makeColorBarParams(vis.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'}
});

// Numeric labels for the legend (using the vis min/mid/max).
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, {margin: '4px 8px'}),
    ui.Label(
      (vis.max / 2),
      {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}
    ),
    ui.Label(vis.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var legendTitle = ui.Label({
  value: 'Map Legend: NDVI composite (max over last 6 months)',
  style: {fontWeight: 'bold'}
});

var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
// Place the legend in slot 3 of the side panel.
inspectorPanel.widgets().set(3, legendPanel);

/**** Map setup ****/

// Clicking the map triggers chart generation.
mapPanel.onClick(generateChart);

// Cursor style for picking points.
mapPanel.style().set('cursor', 'crosshair');

// Initial viewport and example point.
var initialPoint = ee.Geometry.Point(13.140410, 55.688018);
mapPanel.centerObject(initialPoint, 12);

/**** Initialize the app ****/

// Replace the root with a split panel (inspector on the left, map on the right).
ui.root.clear();
ui.root.add(ui.SplitPanel(inspectorPanel, mapPanel));

// Pre-populate the chart at load time using the initial point.
generateChart({
  lon: initialPoint.coordinates().get(0).getInfo(),
  lat: initialPoint.coordinates().get(1).getInfo()
});

/**** Data masking and NDVI derivation ****/

// Masks likely cloud-free pixels using the Sentinel-2 Scene Classification Layer (SCL)
// and adds an NDVI band computed from NIR (B8) and RED (B4).
// Note: This mask retains SCL classes 4 (Vegetation), 5 (Bare soil), 6 (Water),
// and 7 (Clouds — low probability). Adjust the mask to your use case if you
// prefer to exclude water or low-probability clouds.
function maskS2clouds(image) {
  var scl = image.select('SCL');
  var mask = scl.eq(4).or(scl.eq(5));
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi).updateMask(mask);
}

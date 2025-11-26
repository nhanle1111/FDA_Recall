# [U.S. Drug Recalls by Brand (OpenFDA + Leaflet + p5.js)](https://editor.p5js.org/nle7674/full/8qdByMX1B)
*Click Title to View Map*

## Overview
This project is an interactive web map that lets users explore U.S. prescription and OTC drug recalls by brand name over a chosen year range. It uses the OpenFDA Drug Enforcement API to fetch recall records and Leaflet.js (inside a p5.js sketch) to plot them on a map of the United States.

The goal is to make recall data more explorable for non-technical users: you type a brand, pick a time window, and see where and why that product has been recalled.

## How it works

**User input (sidebar):**
- Brand / product keyword (e.g., Advil, Tylenol, Mylan)
- Start year and end year dropdowns (from 2004 to the current year)

**API querying:**
- First searches: openfda.brand_name:"<brand>"
- If that returns no results, it falls back to: product_description:"<brand>"
- Filters results by report_date within the selected year range
- Limits results to a manageable number (for performance)

**Map visualization:**
- Uses Leaflet with an OpenStreetMap basemap.
- Each recall appears as a circle marker placed at the state centroid (since OpenFDA only reports city + state, not exact coordinates).
- Marker color encodes recall class:
  - Class I – highest risk
  - Class II
  - Class III

- Clicking a marker opens a popup with:
  - Brand name
  - Product description
  - Recall class
  - City & state
  - Reason for recall
  - Recalling firm
  - Recall initiation date & report date

**Sidebar UI:**
- Search panel with brand input + year range
- Legend showing class colors
- Status area for simple feedback (e.g., “Found 12 recalls for Advil …”).

## Data source

All recall data comes from the OpenFDA Drug Enforcement API:
```
https://api.fda.gov/drug/enforcement.json
```
## Technology
- p5.js — structure, DOM selection, and JSON fetching (loadJSON)
- Leaflet.js — map rendering and markers
- OpenStreetMap — basemap tiles
- Plain HTML/CSS for layout and sidebar UI

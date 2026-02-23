# albert-analysis

This is a personal analytics dashboard — a Next.js 15 app that visualizes historical utility bills, vehicle service records, and other personal financial data. Data is extracted from PDFs in `albert-business` via Python scripts, stored as JSON in `data/`, and rendered server-side into interactive charts.

## Tech stack

- **Next.js 15** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Chart.js** + `react-chartjs-2` for charts
- **pymupdf** (Python) for PDF extraction in scripts

## Directory structure

```
albert-analysis/
├── data/                        # JSON data files consumed by the app (source of truth for the UI)
├── scripts/                     # Python scripts that extract data from PDFs in albert-business
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Dashboard homepage (summary cards linking to all analyses)
│   │   ├── properties/
│   │   │   ├── 110-tudor-st/
│   │   │   │   ├── electric/    # Eversource electric history for 110 Tudor St
│   │   │   │   ├── gas/         # National Grid gas history for 110 Tudor St
│   │   │   │   └── water/       # BWSC water/sewer history for 110 Tudor St
│   │   │   └── 69-hitching-post-lane/
│   │   │       └── electric/    # Eversource electric history for 69 Hitching Post Ln
│   │   └── vehicles/
│   │       ├── nissan-rogue/    # 2018 Nissan Rogue service history
│   │       └── tesla-model3/    # Tesla Model 3 service history
│   ├── components/              # Reusable UI components
│   │   ├── BarChart.tsx         # Client-side bar chart (usage, cost, and rate modes)
│   │   ├── MileageLineChart.tsx # Time-scale line chart for vehicle mileage
│   │   ├── BackButton.tsx       # Back-to-dashboard navigation
│   │   ├── PropertyLabel.tsx    # Property address badge
│   │   ├── ServiceTable.tsx     # Vehicle service events table
│   │   └── StatCard.tsx         # Summary stat display card
│   └── lib/
│       ├── data.ts              # Data loading functions and processing logic (server-side)
│       └── types.ts             # TypeScript types for all data shapes
```

## Data files (`data/`)

All data files are plain JSON arrays (or objects for vehicles). Pages load them server-side via `fs.readFileSync` in `src/lib/data.ts`.

| File | Source | Key fields |
|---|---|---|
| `electric_110_tudor.json` | Eversource (110 Tudor St) | `kwh`, `supply`, `delivery`, `period_start`, `period_end`, `statement_date` |
| `electric_69hpl.json` | Eversource (69 Hitching Post Ln) | same as above |
| `gas_110_tudor.json` | National Grid (110 Tudor St) | `therms`, `supply`, `delivery`, `period_start`, `period_end`, `statement_date` |
| `water_110_tudor.json` | BWSC (110 Tudor St) | `cf`, `water`, `sewer`, `period_start`, `period_end`, `statement_date` |
| `vehicle_nissan_rogue.json` | Manual | `make`, `model`, `year`, `vin`, `color`, `acquired_date`, `acquired_miles`, `events[]` |
| `vehicle_tesla_model3.json` | Manual | same shape as above |

## Python extraction scripts (`scripts/`)

Each script reads PDF statements from `albert-business`, extracts structured data, and writes a JSON file. They require `pymupdf` (`pip install pymupdf`).

| Script | Reads from | Writes to |
|---|---|---|
| `extract_electric_110tudor.py` | `albert-business/property_110_tudor_st/service_providers/eversource_electric/` | `albert_git_repos/electric_data.json` |
| `extract_electric_69hpl.py` | `albert-business/property_69_hitching_post_lane/service_providers/eversource_electric/` | `albert_git_repos/electric_data_69hpl.json` |
| `extract_gas_110tudor.py` | `albert-business/property_110_tudor_st/service_providers/national_grid_gas/` | `albert_git_repos/gas_data_110tudor.json` |
| `extract_water_110tudor.py` | `albert-business/property_110_tudor_st/service_providers/boston_water_sewer/` | `albert_git_repos/water_data_110tudor.json` |

> **Note:** Scripts write their output to the parent `albert_git_repos/` directory, not directly into `data/`. After running a script, copy the output file into `data/` under the correct name (see table above).

Scripts filter for PDFs with "Statement" in the filename. They handle two PDF text encoding variants: normal readable PDFs and garbled/encoded ones (the latter are decoded using a +29 ASCII offset technique that reverses the encoding used by older NStar/National Grid PDFs).

### Running a script

```bash
cd /Users/albert/albert_git_repos/albert-analysis
python3 scripts/extract_electric_110tudor.py
# Output written to /Users/albert/albert_git_repos/electric_data.json
cp /Users/albert/albert_git_repos/electric_data.json data/electric_110_tudor.json
```

Repeat for other scripts as needed, then restart the dev server to pick up the new data.

## Running the app

```bash
npm run dev    # Development server at http://localhost:3000
npm run build  # Production build
npm run start  # Serve production build
```

## Important Next.js 15 patterns

- **No `ssr: false`** with `next/dynamic` in Server Components. Client components that need to avoid SSR (e.g., Chart.js canvases) use a `useState(mounted)` guard instead — render `null` until mounted.
- All pages are **Server Components** that load and process data at request time. Chart components are Client Components that receive pre-processed data as props.
- Data loading happens in `src/lib/data.ts` via `readFileSync` — this only runs server-side.

## Adding a new analysis

1. Add a new JSON data file to `data/` (and a script to `scripts/` if it's extracted from PDFs).
2. Add the TypeScript type to `src/lib/types.ts`.
3. Add a load function and a process function to `src/lib/data.ts`.
4. Create a new page at the appropriate URL path under `src/app/`.
5. Add a summary card linking to the new page in `src/app/page.tsx`.

## Vehicle data (manual)

Vehicle JSON files are maintained by hand, not extracted from PDFs. To add a service event, append an entry to the `events` array in the appropriate `data/vehicle_*.json` file following the existing shape (`date`, `miles`, `label`, `detail`, `is_purchase`, `provider`, `service`, `cost`).

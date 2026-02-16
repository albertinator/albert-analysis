#!/usr/bin/env python3
"""Generate an HTML chart of water usage at 110 Tudor St."""

import json
from datetime import datetime

with open("/Users/albert/albert_git_repos/water_data_110tudor.json") as f:
    data = json.load(f)

data.sort(key=lambda d: d["statement_date"])

labels = []
cf_values = []
water_values = []
sewer_values = []

for d in data:
    date_str = d.get("period_end") or d["statement_date"]
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        labels.append(dt.strftime("%b %Y"))
    except:
        labels.append(date_str)

    cf_values.append(d["cf"] or 0)
    water_values.append(d["water"] or 0)
    sewer_values.append(d["sewer"] or 0)

html = f"""<!DOCTYPE html>
<html>
<head>
<title>110 Tudor St - Water Usage (2009-2026)</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
  }}
  h1 {{
    text-align: center;
    color: #333;
  }}
  .chart-container {{
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }}
  .summary {{
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin: 20px 0;
  }}
  .stat-card {{
    background: white;
    border-radius: 8px;
    padding: 15px 25px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
    margin: 5px;
  }}
  .stat-card .value {{
    font-size: 28px;
    font-weight: bold;
    color: #1565C0;
  }}
  .stat-card .label {{
    color: #666;
    font-size: 14px;
    margin-top: 4px;
  }}
</style>
</head>
<body>
<h1>110 Tudor St - Water Usage History</h1>
<p style="text-align:center;color:#666;">Boston Water & Sewer Commission | Jul 2009 - Feb 2026 | {len(data)} billing periods</p>

<div class="summary">
  <div class="stat-card">
    <div class="value">{sum(cf_values):,}</div>
    <div class="label">Total Cubic Feet Used</div>
  </div>
  <div class="stat-card">
    <div class="value">{round(sum(cf_values)/len(cf_values))}</div>
    <div class="label">Avg CF / Period</div>
  </div>
  <div class="stat-card">
    <div class="value">{max(cf_values):,}</div>
    <div class="label">Peak CF (Single Period)</div>
  </div>
  <div class="stat-card">
    <div class="value">${sum(water_values) + sum(sewer_values):,.0f}</div>
    <div class="label">Total Water + Sewer Cost</div>
  </div>
</div>

<div class="chart-container">
  <canvas id="cfChart" height="100"></canvas>
</div>

<div class="chart-container">
  <canvas id="costChart" height="100"></canvas>
</div>

<script>
const labels = {json.dumps(labels)};
const cfData = {json.dumps(cf_values)};
const waterData = {json.dumps(water_values)};
const sewerData = {json.dumps(sewer_values)};

new Chart(document.getElementById('cfChart'), {{
  type: 'bar',
  data: {{
    labels: labels,
    datasets: [{{
      label: 'Cubic Feet Used',
      data: cfData,
      backgroundColor: 'rgba(21, 101, 192, 0.7)',
      borderColor: 'rgba(21, 101, 192, 1)',
      borderWidth: 1
    }}]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Water Consumption (Cubic Feet) per Billing Period',
        font: {{ size: 18 }}
      }},
      tooltip: {{
        callbacks: {{
          label: function(ctx) {{
            const cf = ctx.parsed.y;
            const gal = Math.round(cf * 7.481);
            return cf.toLocaleString() + ' CF (' + gal.toLocaleString() + ' gallons)';
          }}
        }}
      }}
    }},
    scales: {{
      x: {{
        ticks: {{
          maxRotation: 90,
          autoSkip: true,
          maxTicksLimit: 40
        }}
      }},
      y: {{
        beginAtZero: true,
        title: {{
          display: true,
          text: 'Cubic Feet (1 CF = 7.481 gallons)'
        }}
      }}
    }}
  }}
}});

new Chart(document.getElementById('costChart'), {{
  type: 'bar',
  data: {{
    labels: labels,
    datasets: [
      {{
        label: 'Water',
        data: waterData,
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1
      }},
      {{
        label: 'Sewer',
        data: sewerData,
        backgroundColor: 'rgba(100, 181, 246, 0.7)',
        borderColor: 'rgba(100, 181, 246, 1)',
        borderWidth: 1
      }}
    ]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Water Cost ($) - Water vs Sewer per Billing Period',
        font: {{ size: 18 }}
      }},
      tooltip: {{
        callbacks: {{
          label: function(ctx) {{
            return ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(2);
          }}
        }}
      }}
    }},
    scales: {{
      x: {{
        stacked: true,
        ticks: {{
          maxRotation: 90,
          autoSkip: true,
          maxTicksLimit: 40
        }}
      }},
      y: {{
        stacked: true,
        beginAtZero: true,
        title: {{
          display: true,
          text: 'Cost ($)'
        }}
      }}
    }}
  }}
}});
</script>
</body>
</html>
"""

output_path = "/Users/albert/albert_git_repos/110_tudor_water_usage.html"
with open(output_path, "w") as f:
    f.write(html)

print(f"Chart saved to: {output_path}")

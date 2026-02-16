#!/usr/bin/env python3
"""Generate an HTML chart of natural gas usage at 110 Tudor St."""

import json
from datetime import datetime

with open("/Users/albert/albert_git_repos/gas_data_110tudor.json") as f:
    data = json.load(f)

data.sort(key=lambda d: d["statement_date"])

labels = []
therms_values = []
supply_values = []
delivery_values = []

for d in data:
    date_str = d.get("period_end") or d["statement_date"]
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        labels.append(dt.strftime("%b %Y"))
    except:
        labels.append(date_str)

    therms_values.append(d["therms"] or 0)
    supply_values.append(d["supply"] or 0)
    delivery_values.append(d["delivery"] or 0)

html = f"""<!DOCTYPE html>
<html>
<head>
<title>110 Tudor St - Natural Gas Usage (2009-2025)</title>
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
    color: #E65100;
  }}
  .stat-card .label {{
    color: #666;
    font-size: 14px;
    margin-top: 4px;
  }}
</style>
</head>
<body>
<h1>110 Tudor St - Natural Gas Usage History</h1>
<p style="text-align:center;color:#666;">National Grid | Jul 2009 - Dec 2025 | {len(data)} billing periods</p>

<div class="summary">
  <div class="stat-card">
    <div class="value">{sum(therms_values):,}</div>
    <div class="label">Total Therms Used</div>
  </div>
  <div class="stat-card">
    <div class="value">{round(sum(therms_values)/len(therms_values))}</div>
    <div class="label">Avg Therms / Period</div>
  </div>
  <div class="stat-card">
    <div class="value">{max(therms_values):,}</div>
    <div class="label">Peak Therms (Single Period)</div>
  </div>
  <div class="stat-card">
    <div class="value">${sum(supply_values) + sum(delivery_values):,.0f}</div>
    <div class="label">Total Gas Cost</div>
  </div>
</div>

<div class="chart-container">
  <canvas id="thermsChart" height="100"></canvas>
</div>

<div class="chart-container">
  <canvas id="costChart" height="100"></canvas>
</div>

<script>
const labels = {json.dumps(labels)};
const thermsData = {json.dumps(therms_values)};
const supplyData = {json.dumps(supply_values)};
const deliveryData = {json.dumps(delivery_values)};

new Chart(document.getElementById('thermsChart'), {{
  type: 'bar',
  data: {{
    labels: labels,
    datasets: [{{
      label: 'Therms Used',
      data: thermsData,
      backgroundColor: 'rgba(230, 81, 0, 0.7)',
      borderColor: 'rgba(230, 81, 0, 1)',
      borderWidth: 1
    }}]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Natural Gas Usage (Therms) per Billing Period',
        font: {{ size: 18 }}
      }},
      tooltip: {{
        callbacks: {{
          label: function(ctx) {{
            return ctx.parsed.y.toLocaleString() + ' therms';
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
          text: 'Therms'
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
        label: 'Supply',
        data: supplyData,
        backgroundColor: 'rgba(239, 108, 0, 0.7)',
        borderColor: 'rgba(239, 108, 0, 1)',
        borderWidth: 1
      }},
      {{
        label: 'Delivery',
        data: deliveryData,
        backgroundColor: 'rgba(255, 183, 77, 0.7)',
        borderColor: 'rgba(255, 183, 77, 1)',
        borderWidth: 1
      }}
    ]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Natural Gas Cost ($) - Supply vs Delivery per Billing Period',
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

output_path = "/Users/albert/albert_git_repos/110_tudor_gas_usage.html"
with open(output_path, "w") as f:
    f.write(html)

print(f"Chart saved to: {output_path}")

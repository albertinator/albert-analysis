#!/usr/bin/env python3
"""Generate an HTML chart of electricity usage at 69 Hitching Post Ln."""

import json
from datetime import datetime

with open("/Users/albert/albert_git_repos/albert-analysis/electric_data_69hpl.json") as f:
    data = json.load(f)

data.sort(key=lambda d: d["statement_date"])

labels = []
kwh_values = []
supply_values = []
delivery_values = []

for d in data:
    date_str = d.get("period_end") or d["statement_date"]
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        labels.append(dt.strftime("%b %Y"))
    except:
        labels.append(date_str)

    kwh_values.append(d["kwh"] or 0)
    supply_values.append(d["supply"] or 0)
    delivery_values.append(d["delivery"] or 0)

# Build per-kWh supply and delivery rates
supply_per_kwh = []
delivery_per_kwh = []
for i in range(len(kwh_values)):
    kwh = kwh_values[i]
    if kwh and kwh > 0:
        supply_per_kwh.append(round(supply_values[i] / kwh, 4))
        delivery_per_kwh.append(round(delivery_values[i] / kwh, 4))
    else:
        supply_per_kwh.append(0)
        delivery_per_kwh.append(0)

html = f"""<!DOCTYPE html>
<html>
<head>
<title>69 Hitching Post Ln - Electricity Usage (2022-2026)</title>
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
    color: #2196F3;
  }}
  .stat-card .label {{
    color: #666;
    font-size: 14px;
    margin-top: 4px;
  }}
</style>
</head>
<body>
<a href="index.html" style="position:absolute;top:20px;left:20px;font-size:14px;color:#666;text-decoration:none;">&larr; Dashboard</a>
<h1>69 Hitching Post Ln - Electricity Usage History</h1>
<p style="text-align:center;color:#666;">Eversource (NH) | Nov 2022 - Jan 2026 | {len(data)} billing periods</p>

<div class="summary">
  <div class="stat-card">
    <div class="value">{sum(kwh_values):,}</div>
    <div class="label">Total kWh Used</div>
  </div>
  <div class="stat-card">
    <div class="value">{round(sum(kwh_values)/len(kwh_values))}</div>
    <div class="label">Avg kWh / Period</div>
  </div>
  <div class="stat-card">
    <div class="value">{max(kwh_values):,}</div>
    <div class="label">Peak kWh (Single Period)</div>
  </div>
  <div class="stat-card">
    <div class="value">${sum(supply_values) + sum(delivery_values):,.0f}</div>
    <div class="label">Total Electricity Cost</div>
  </div>
</div>

<div class="chart-container">
  <canvas id="kwhChart" height="100"></canvas>
</div>

<div class="chart-container">
  <canvas id="costChart" height="100"></canvas>
</div>

<div class="chart-container">
  <canvas id="rateChart" height="100"></canvas>
</div>

<script>
const labels = {json.dumps(labels)};
const kwhData = {json.dumps(kwh_values)};
const supplyData = {json.dumps(supply_values)};
const deliveryData = {json.dumps(delivery_values)};
const supplyPerKwh = {json.dumps(supply_per_kwh)};
const deliveryPerKwh = {json.dumps(delivery_per_kwh)};

new Chart(document.getElementById('kwhChart'), {{
  type: 'bar',
  data: {{
    labels: labels,
    datasets: [{{
      label: 'kWh Usage',
      data: kwhData,
      backgroundColor: 'rgba(33, 150, 243, 0.7)',
      borderColor: 'rgba(33, 150, 243, 1)',
      borderWidth: 1
    }}]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Electricity Usage (kWh) per Billing Period',
        font: {{ size: 18 }}
      }},
      tooltip: {{
        callbacks: {{
          label: function(ctx) {{
            return ctx.parsed.y.toLocaleString() + ' kWh';
          }}
        }}
      }}
    }},
    scales: {{
      x: {{
        ticks: {{ maxRotation: 90, autoSkip: false }}
      }},
      y: {{
        beginAtZero: true,
        title: {{ display: true, text: 'kWh' }}
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
        label: 'Supply (Generation)',
        data: supplyData,
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }},
      {{
        label: 'Delivery',
        data: deliveryData,
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1
      }}
    ]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Electricity Cost ($) - Supply vs Delivery per Billing Period',
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
        ticks: {{ maxRotation: 90, autoSkip: false }}
      }},
      y: {{
        stacked: true,
        beginAtZero: true,
        title: {{ display: true, text: 'Cost ($)' }}
      }}
    }}
  }}
}});

// Price per kWh Chart - Stacked Supply vs Delivery Rate
new Chart(document.getElementById('rateChart'), {{
  type: 'bar',
  data: {{
    labels: labels,
    datasets: [
      {{
        label: 'Supply Rate ($/kWh)',
        data: supplyPerKwh,
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }},
      {{
        label: 'Delivery Rate ($/kWh)',
        data: deliveryPerKwh,
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1
      }}
    ]
  }},
  options: {{
    responsive: true,
    plugins: {{
      title: {{
        display: true,
        text: 'Electricity Price ($/kWh) - Supply vs Delivery Rate per Billing Period',
        font: {{ size: 18 }}
      }},
      tooltip: {{
        callbacks: {{
          label: function(ctx) {{
            return ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(4);
          }},
          afterBody: function(tooltipItems) {{
            const idx = tooltipItems[0].dataIndex;
            const total = supplyPerKwh[idx] + deliveryPerKwh[idx];
            return 'Total: $' + total.toFixed(4) + '/kWh';
          }}
        }}
      }}
    }},
    scales: {{
      x: {{
        stacked: true,
        ticks: {{ maxRotation: 90, autoSkip: false }}
      }},
      y: {{
        stacked: true,
        beginAtZero: true,
        title: {{ display: true, text: 'Price ($/kWh)' }}
      }}
    }}
  }}
}});
</script>
</body>
</html>
"""

output_path = "/Users/albert/albert_git_repos/albert-analysis/69_hpl_electric_usage.html"
with open(output_path, "w") as f:
    f.write(html)

print(f"Chart saved to: {output_path}")

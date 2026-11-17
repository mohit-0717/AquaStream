/**
 * core/charts.js
 * ============================================================
 * Shared Chart.js visualisations used in Tab 1
 *
 * Functions:
 *   initLongitudinalChart(paramKey)     — 24-month line chart with gradient fill
 *   changeLongitudinalParam(paramKey)   — Swap parameter + update stat cards
 *   initLocationTypeChart()             — Doughnut exceedance breakdown
 *
 * Data source: parameterSeriesData, months (data/data.js)
 * ============================================================
 */

/* ----------------------------------------------------------
   LONGITUDINAL LINE CHART (24-Month Time Series)
   ---------------------------------------------------------- */

/**
 * Create (or recreate) the main longitudinal line chart.
 * paramKey: 'DO' | 'Temp' | 'Turbidity' | 'pH' | 'Nitrate'
 */
function initLongitudinalChart(paramKey = 'DO') {
  const canvas = document.getElementById('longitudinalChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pData = parameterSeriesData[paramKey] || parameterSeriesData.DO;

  // Vertical gradient area fill (oceanic teal by default)
  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, pData.fillColorStart);
  gradient.addColorStop(1, pData.fillColorEnd);

  // Destroy previous instance before creating a new one
  if (longitudinalChartInstance) {
    longitudinalChartInstance.destroy();
  }

  longitudinalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: pData.label,
        data: pData.values,
        borderColor: pData.color,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: pData.color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: pData.color,
        pointHoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: "'Figtree', sans-serif", size: 12, weight: '600' },
            color: '#334155'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleFont: { family: "'Figtree', sans-serif", size: 13, weight: '700' },
          bodyFont:  { family: "'JetBrains Mono', monospace", size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: context =>
              ` ${context.dataset.label}: ${context.parsed.y} ${pData.unit}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Figtree', sans-serif", size: 11 },
            color: '#64748b',
            maxRotation: 45
          }
        },
        y: {
          grid: { color: 'rgba(226, 232, 240, 0.7)' },
          ticks: {
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            color: '#64748b',
            callback: val => val + ' ' + pData.unit
          }
        }
      }
    }
  });

  // ---- Update the 4 stat cards below the chart ----
  const baselineEl = document.getElementById('stat-baseline');
  const troughEl   = document.getElementById('stat-trough');
  const threshEl   = document.getElementById('stat-thresh');
  if (baselineEl) baselineEl.textContent = pData.baseline;
  if (troughEl)   troughEl.textContent   = pData.trough;
  if (threshEl)   threshEl.textContent   = pData.threshold;
}

/**
 * Handle parameter chip clicks — updates chip active styling
 * and re-renders the longitudinal chart for the selected parameter.
 */
function changeLongitudinalParam(paramKey) {
  document.querySelectorAll('#param-selector-group button').forEach(btn => {
    if (btn.getAttribute('data-param') === paramKey) {
      btn.className = 'chip chip-ocean text-xs font-semibold py-1 px-2.5 transition-all shadow-sm shrink-0';
    } else {
      btn.className = 'chip chip-neutral text-xs font-semibold py-1 px-2.5 transition-all hover:border-slate-300 shrink-0';
    }
  });
  initLongitudinalChart(paramKey);
}

/* ----------------------------------------------------------
   LOCATION TYPE DOUGHNUT CHART
   ---------------------------------------------------------- */

/** Render the doughnut chart showing exceedance counts by water body type. */
function initLocationTypeChart() {
  const canvas = document.getElementById('locationTypeChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  locationTypeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Estuary / Coastal', 'Stream / River', 'Lake / Reservoir', 'Groundwater Well'],
      datasets: [{
        data: [148200, 142100, 52300, 12220],
        backgroundColor: ['#0f7c8a', '#10b981', '#0284c7', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            font: { family: "'Figtree', sans-serif", size: 10, weight: '500' },
            color: '#475569'
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} excursions`
          }
        }
      },
      cutout: '68%'
    }
  });
}

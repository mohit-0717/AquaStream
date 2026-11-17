/**
 * 03_olap_benchmarks/benchmark.js
 * ============================================================
 * TAB 3 — Distributed Citus vs Centralised PostgreSQL Benchmark
 *          + Real-Time Kafka Replay Stream Simulation
 *
 * Functions:
 *   initBenchmarkChart()      — Render the bar chart on first load
 *   updateBenchmarkChart()    — Swap dataset when query dropdown changes
 *   startReplaySimulation()   — Begin live ticker loop
 *   toggleReplayStream()      — Pause / resume the ticker
 *
 * Data source: benchmarkData (data/data.js)
 * ============================================================
 */

/** Chart.js instance — kept module-level for update/destroy access. */
// (benchmarkChartInstance is declared globally in core/main.js)

/* ----------------------------------------------------------
   BENCHMARK CHART
   ---------------------------------------------------------- */

/** Render the initial grouped-bar chart for Q1 (default). */
function initBenchmarkChart() {
  const canvas = document.getElementById('benchmarkChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const q = benchmarkData.q1;

  benchmarkChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: q.rows,
      datasets: [
        {
          label: 'Centralised PostgreSQL (ms)',
          data: q.centralized,
          backgroundColor: 'rgba(217, 119, 6, 0.75)',
          borderColor: '#d97706',
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Distributed Citus 8-Node (ms)',
          data: q.distributed,
          backgroundColor: 'rgba(15, 124, 138, 0.85)',
          borderColor: '#0f7c8a',
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: "'Figtree', sans-serif", size: 11, weight: '600' },
            color: '#334155'
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} ms`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Record Volume (Dataset Scale)',
            font: { family: "'Figtree', sans-serif", size: 11 }
          },
          grid: { display: false }
        },
        y: {
          title: {
            display: true,
            text: 'Query Latency (Milliseconds)',
            font: { family: "'Figtree', sans-serif", size: 11 }
          },
          grid: { color: 'rgba(226, 232, 240, 0.7)' },
          ticks: { font: { family: "'JetBrains Mono', monospace" } }
        }
      }
    }
  });
}

/** Swap chart data when the user selects a different query from the dropdown. */
function updateBenchmarkChart() {
  const select = document.getElementById('benchmark-query-select');
  if (!select || !benchmarkChartInstance) return;

  const q = benchmarkData[select.value] || benchmarkData.q1;
  benchmarkChartInstance.data.datasets[0].data = q.centralized;
  benchmarkChartInstance.data.datasets[1].data = q.distributed;
  benchmarkChartInstance.update();
}

/* ----------------------------------------------------------
   REAL-TIME KAFKA REPLAY STREAM SIMULATION
   ---------------------------------------------------------- */

const _replaySites = [
  'USGS-01578310', 'USGS-01576000', 'EPA-CB-00412',
  'USGS-01594440', 'USGS-01646500'
];

/** Start the interval-based live-ticker that simulates streaming sensor data. */
function startReplaySimulation() {
  if (streamInterval) clearInterval(streamInterval);

  streamInterval = setInterval(() => {
    if (!isReplayStreaming) return;

    const temp   = (20.5 + Math.random() * 2.8).toFixed(1);
    const doVal  = (6.8  + (Math.random() * 1.2 - 0.4)).toFixed(2);
    const alerts = Math.floor(10 + Math.random() * 10);
    const site   = _replaySites[Math.floor(Math.random() * _replaySites.length)];

    const tempEl   = document.getElementById('stream-temp');
    const doEl     = document.getElementById('stream-do');
    const alertsEl = document.getElementById('stream-alerts');
    const siteEl   = document.getElementById('stream-site');

    if (tempEl)   tempEl.textContent   = `${temp} °C`;
    if (doEl)     doEl.textContent     = `${doVal} mg/L`;
    if (alertsEl) alertsEl.textContent = `${alerts} Alerts / min`;
    if (siteEl)   siteEl.textContent   = site;
  }, 1400);
}

/** Toggle the replay stream between paused and running states. */
function toggleReplayStream() {
  isReplayStreaming = !isReplayStreaming;

  const btnText = document.getElementById('replay-btn-text');
  const icon    = document.getElementById('replay-icon');

  if (btnText && icon) {
    if (isReplayStreaming) {
      btnText.textContent = 'Pause Stream';
      icon.setAttribute('data-lucide', 'pause');
    } else {
      btnText.textContent = 'Resume Stream';
      icon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

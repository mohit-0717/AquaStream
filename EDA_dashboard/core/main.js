/**
 * core/main.js
 * ============================================================
 * Application Bootstrap — Tab Navigation + Global State
 *
 * Responsibilities:
 *   • Declares all shared mutable state variables
 *   • Implements tab switching (switchViewTab)
 *   • Calls all init functions on DOMContentLoaded
 *
 * Script load order (index.html):
 *   1. data/data.js
 *   2. core/charts.js
 *   3. 01_executive_overview/findings.js
 *   4. 02_dimensional_schema/schema.js
 *   5. 03_olap_benchmarks/olap.js
 *   6. 03_olap_benchmarks/benchmark.js
 *   7. 04_predictive_ml/regression.js
 *   8. 04_predictive_ml/association_rules.js
 *   9. core/main.js   ← this file (always last)
 * ============================================================
 */

/* ----------------------------------------------------------
   GLOBAL STATE — shared across all modules
   ---------------------------------------------------------- */
let currentTab              = 'tab-1';
let longitudinalChartInstance = null;   // used by core/charts.js
let locationTypeChartInstance = null;   // used by core/charts.js
let benchmarkChartInstance    = null;   // used by 03_olap_benchmarks/benchmark.js
let isReplayStreaming          = true;   // used by 03_olap_benchmarks/benchmark.js
let streamInterval             = null;   // used by 03_olap_benchmarks/benchmark.js

/* ----------------------------------------------------------
   TAB NAVIGATION
   ---------------------------------------------------------- */

/**
 * Show the selected tab section and hide all others.
 * Also resizes charts after they become visible (Chart.js requires this).
 *
 * tabId: 'tab-1' | 'tab-2' | 'tab-3' | 'tab-4'
 */
function switchViewTab(tabId) {
  currentTab = tabId;

  ['tab-1', 'tab-2', 'tab-3', 'tab-4'].forEach(id => {
    const section = document.getElementById(id);
    const btn     = document.getElementById('tab-btn-' + id.split('-')[1]);
    if (!section || !btn) return;

    if (id === tabId) {
      section.classList.remove('hidden');
      btn.classList.add('active');
    } else {
      section.classList.add('hidden');
      btn.classList.remove('active');
    }
  });

  // Resize charts when their container becomes visible
  if (tabId === 'tab-1') {
    if (longitudinalChartInstance) longitudinalChartInstance.resize();
    if (locationTypeChartInstance)  locationTypeChartInstance.resize();
  } else if (tabId === 'tab-3') {
    if (benchmarkChartInstance) benchmarkChartInstance.resize();
  }
}

/* ----------------------------------------------------------
   INITIALISATION
   ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function () {

  // 1. Initialise Lucide icon set
  if (window.lucide) window.lucide.createIcons();

  // 2. TAB 1 — Executive Overview charts + accordion findings
  initLongitudinalChart('DO');
  initLocationTypeChart();
  renderAccordionFindings();

  // 3. TAB 2 — Dimensional schema: load default fact table inspector
  selectSchemaElement('fact');

  // 4. TAB 3 — OLAP simulator defaults + benchmark chart + replay stream
  runOlapOp('rollup');
  initBenchmarkChart();
  startReplaySimulation();

  // 5. TAB 4 — Predictive ML: render gauge at default slider values
  //            and show association rules with lift >= 2.0
  updatePredictiveModel();
  renderAssociationRules(2.0);
});

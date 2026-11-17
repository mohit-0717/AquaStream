/**
 * 04_predictive_ml/regression.js
 * ============================================================
 * TAB 4 — Multiple Linear Regression DO Predictor
 *          + Circular SVG Gauge Meter
 *
 * Trained formula (from dataset):
 *   DO = 14.12 − 0.285·Temp + 0.382·pH − 0.048·Turbidity
 *        − 0.0021·Conductivity − 0.142·Nitrate
 *
 * Functions:
 *   calculatePredictedDO(temp, ph, turb, cond, nitrate)
 *   updatePredictiveModel()   — Reads slider values → updates gauge
 *   updateCircularGauge(val)  — Redraws SVG arc + colours + status text
 *   resetPredictorSliders()   — Restore all sliders to baseline defaults
 * ============================================================
 */

/* ----------------------------------------------------------
   MODEL — Multiple Linear Regression
   ---------------------------------------------------------- */

/**
 * Compute the predicted Dissolved Oxygen (mg/L) from 5 co-measured predictors.
 * Clamps output to realistic DO range [0.2, 14.5] mg/L.
 */
function calculatePredictedDO(temp, ph, turb, cond, nitrate) {
  let doVal = 14.12
    - (0.285  * temp)
    + (0.382  * ph)
    - (0.048  * turb)
    - (0.0021 * cond)
    - (0.142  * nitrate);

  // Clamp to physically plausible range
  if (doVal < 0.2)  doVal = 0.2;
  if (doVal > 14.5) doVal = 14.5;
  return parseFloat(doVal.toFixed(2));
}

/* ----------------------------------------------------------
   SLIDER INTERACTION
   ---------------------------------------------------------- */

/**
 * Read all five slider values, update their display labels,
 * run the regression model, and refresh the circular gauge.
 * Called on every slider oninput event.
 */
function updatePredictiveModel() {
  const temp     = parseFloat(document.getElementById('slider-temp').value);
  const ph       = parseFloat(document.getElementById('slider-ph').value);
  const turb     = parseFloat(document.getElementById('slider-turbidity').value);
  const cond     = parseFloat(document.getElementById('slider-conductivity').value);
  const nitrate  = parseFloat(document.getElementById('slider-nitrate').value);

  // Update live display labels
  document.getElementById('val-temp').textContent        = temp.toFixed(1);
  document.getElementById('val-ph').textContent          = ph.toFixed(1);
  document.getElementById('val-turbidity').textContent   = turb.toFixed(1);
  document.getElementById('val-conductivity').textContent = cond.toFixed(0);
  document.getElementById('val-nitrate').textContent     = nitrate.toFixed(1);

  // Run model and refresh gauge
  const doPred = calculatePredictedDO(temp, ph, turb, cond, nitrate);
  updateCircularGauge(doPred);
}

/** Reset all sliders to their baseline default values and refresh the gauge. */
function resetPredictorSliders() {
  document.getElementById('slider-temp').value        = 21.5;
  document.getElementById('slider-ph').value          = 7.4;
  document.getElementById('slider-turbidity').value   = 12.0;
  document.getElementById('slider-conductivity').value = 380;
  document.getElementById('slider-nitrate').value     = 3.2;
  updatePredictiveModel();
}

/* ----------------------------------------------------------
   CIRCULAR SVG GAUGE
   ---------------------------------------------------------- */

/**
 * Update the circular SVG arc meter based on predicted DO value.
 *
 * Colour thresholds (EPA Clean Water standards):
 *   < 4.0  mg/L  → Red    (Hypoxic Crisis)
 *   4.0–6.5 mg/L → Amber  (Aquatic Stress)
 *   > 6.5  mg/L  → Emerald (Healthy Baseline)
 *
 * Gauge circumference: 2 × π × r78 ≈ 490.08 px
 * Arc sweep is 75% of full circle (270°).
 */
function updateCircularGauge(value) {
  const gaugeArc     = document.getElementById('gaugeArc');
  const valueText    = document.getElementById('gaugeValueText');
  const statusChip   = document.getElementById('gaugeStatusChip');
  const ratingEl     = document.getElementById('risk-rating');
  const explanationEl = document.getElementById('risk-explanation');

  if (!gaugeArc || !valueText || !statusChip) return;

  // Update numeric readout
  valueText.textContent = value.toFixed(2);

  // Calculate arc stroke offset (270° sweep)
  const maxDO   = 14.0;
  const fraction = Math.min(Math.max(value / maxDO, 0.05), 1.0);
  const offset   = 490 - (490 * fraction * 0.75);
  gaugeArc.style.strokeDashoffset = offset;

  // ---- Colour + status based on DO threshold ----
  if (value < 4.0) {
    // HYPOXIC — Red
    gaugeArc.style.stroke   = '#dc2626';
    valueText.className     = 'text-4xl font-extrabold font-mono text-red-600 mt-0.5 tracking-tight';
    statusChip.className    = 'chip chip-critical text-[0.68rem] mt-2 shrink-0';
    statusChip.textContent  = 'Hypoxic Crisis (<4.0)';
    if (ratingEl) {
      ratingEl.textContent  = 'Critical Anoxic Danger';
      ratingEl.className    = 'font-mono text-red-700 font-bold';
    }
    if (explanationEl) {
      explanationEl.textContent = 'Severe dissolved oxygen depletion triggers high mortality among fish species, suppresses benthic invertebrate respiration, and breaches EPA Clean Water Act standards.';
    }

  } else if (value <= 6.5) {
    // STRESS — Amber
    gaugeArc.style.stroke   = '#d97706';
    valueText.className     = 'text-4xl font-extrabold font-mono text-amber-600 mt-0.5 tracking-tight';
    statusChip.className    = 'chip chip-warning text-[0.68rem] mt-2 shrink-0';
    statusChip.textContent  = 'Aquatic Stress (4.0–6.5)';
    if (ratingEl) {
      ratingEl.textContent  = 'Sub-optimal Stress Zone';
      ratingEl.className    = 'font-mono text-amber-700 font-bold';
    }
    if (explanationEl) {
      explanationEl.textContent = 'Oxygen levels exhibit biological stress; coldwater salmonids and sensitive larvae suffer reduced feeding rates and delayed developmental growth.';
    }

  } else {
    // HEALTHY — Emerald
    gaugeArc.style.stroke   = '#10b981';
    valueText.className     = 'text-4xl font-extrabold font-mono text-emerald-600 mt-0.5 tracking-tight';
    statusChip.className    = 'chip chip-positive text-[0.68rem] mt-2 shrink-0';
    statusChip.textContent  = 'Baseline Healthy (>6.5)';
    if (ratingEl) {
      ratingEl.textContent  = 'Optimal Habitat';
      ratingEl.className    = 'font-mono text-emerald-700 font-bold';
    }
    if (explanationEl) {
      explanationEl.textContent = 'Dissolved oxygen levels support thriving aquatic biodiversity, sensitive fish populations, and vigorous biological self-purification capacity.';
    }
  }
}

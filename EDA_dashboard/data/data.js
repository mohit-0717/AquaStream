/**
 * data/data.js
 * ============================================================
 * All static data constants for AquaStream Analytics.
 * Edit this file to update chart series, findings text,
 * benchmark numbers, OLAP queries, ML rules, or schema info.
 * ============================================================
 */

/* ----------------------------------------------------------
   1. TIME AXIS — 24-Month Longitudinal Labels (2024–2025)
   ---------------------------------------------------------- */
const months = [
  'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24',
  'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
  'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
  'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25'
];

/* ----------------------------------------------------------
   2. PARAMETER SERIES DATA — Tab 1 Longitudinal Chart
      Each key maps to one parameter the user can select.
   ---------------------------------------------------------- */
const parameterSeriesData = {
  DO: {
    label: 'Dissolved Oxygen (mg/L)',
    unit: 'mg/L',
    baseline: '7.34 mg/L',
    trough: '5.12 mg/L (Jul–Aug)',
    threshold: '> 5.00 mg/L',
    color: '#0f7c8a',
    fillColorStart: 'rgba(15, 124, 138, 0.35)',
    fillColorEnd:   'rgba(15, 124, 138, 0.01)',
    values: [9.8, 9.5, 8.6, 7.9, 7.1, 6.0, 5.1, 5.2, 6.4, 7.5, 8.4, 9.2,
             9.9, 9.4, 8.5, 7.8, 7.0, 6.1, 5.3, 5.4, 6.3, 7.4, 8.3, 9.1]
  },
  Temp: {
    label: 'Water Temperature (°C)',
    unit: '°C',
    baseline: '21.5°C',
    trough: '4.2°C (Winter)',
    threshold: '< 28.0°C',
    color: '#d97706',
    fillColorStart: 'rgba(217, 119, 6, 0.32)',
    fillColorEnd:   'rgba(217, 119, 6, 0.01)',
    values: [4.2, 5.1, 9.4, 14.8, 20.1, 24.8, 28.1, 27.6, 23.4, 17.2, 10.5, 5.8,
             4.5, 5.3, 9.8, 15.1, 20.5, 25.2, 27.9, 27.3, 23.1, 16.9, 10.2, 5.5]
  },
  Turbidity: {
    label: 'Turbidity (NTU)',
    unit: 'NTU',
    baseline: '12.0 NTU',
    trough: '3.4 NTU (Winter Baseflow)',
    threshold: '< 25.0 NTU',
    color: '#0284c7',
    fillColorStart: 'rgba(2, 132, 199, 0.32)',
    fillColorEnd:   'rgba(2, 132, 199, 0.01)',
    values: [5.4, 7.2, 14.8, 11.2, 9.6, 12.4, 18.2, 16.8, 10.4, 8.6, 6.2, 4.8,
             4.9, 6.8, 13.2, 10.8, 9.2, 13.1, 19.4, 17.2, 11.1, 8.4, 5.9, 4.5]
  },
  pH: {
    label: 'pH Units',
    unit: 'pH',
    baseline: '7.4 pH',
    trough: '6.8 pH (Storm Runoff)',
    threshold: '6.5 – 8.5 pH',
    color: '#10b981',
    fillColorStart: 'rgba(16, 185, 129, 0.32)',
    fillColorEnd:   'rgba(16, 185, 129, 0.01)',
    values: [7.4, 7.5, 7.2, 7.1, 7.3, 7.6, 7.8, 7.7, 7.5, 7.4, 7.3, 7.4,
             7.5, 7.4, 7.1, 7.0, 7.4, 7.7, 7.9, 7.8, 7.6, 7.4, 7.3, 7.4]
  },
  Nitrate: {
    label: 'Nitrate Concentration (mg/L)',
    unit: 'mg/L',
    baseline: '3.18 mg/L',
    trough: '1.42 mg/L (Late Summer)',
    threshold: '< 10.0 mg/L',
    color: '#6366f1',
    fillColorStart: 'rgba(99, 102, 241, 0.35)',
    fillColorEnd:   'rgba(99, 102, 241, 0.01)',
    values: [4.8, 5.1, 5.8, 4.6, 3.4, 2.2, 1.6, 1.5, 2.1, 2.9, 3.8, 4.5,
             4.9, 5.4, 6.1, 4.8, 3.2, 2.1, 1.7, 1.4, 2.3, 3.1, 4.0, 4.7]
  }
};

/* ----------------------------------------------------------
   3. MANDATORY BUSINESS FINDINGS — Tab 1 Accordion (10 items)
      question → method → evidence → interpretation → recommendation
   ---------------------------------------------------------- */
const mandatoryFindings = [
  {
    num: 1,
    title: 'Longitudinal Parameter Trajectory & Multi-Year Seasonality',
    question: 'Analyze water-quality measurements over time to evaluate seasonal cyclic amplitude.',
    method: 'Time-series decomposition on FactWaterQualityResult aggregated across 24 consecutive calendar months.',
    evidence: 'Dissolved Oxygen demonstrates inverse oscillation with temperature (r = -0.74, p < 0.001), peaking at 9.9 mg/L in January and troughing at 5.12 mg/L in late July across all 12 monitored river basins.',
    interpretation: 'Gas solubility physics govern winter oxygen saturation, while biological respiration and thermal stratification drive profound summertime depletion.',
    recommendation: 'Establish automated seasonal sensitivity buffers in environmental monitoring pipelines from June to September.',
    status: 'Seasonal Alert',
    chipClass: 'chip-warning'
  },
  {
    num: 2,
    title: 'Spatial Disparity across 842 Continuous Monitoring Stations',
    question: 'Compare parameter variance and dispersion across discrete monitoring sites.',
    method: 'Multi-site cross-tabulation in OLAP cube grouping by WatershedRegion and LocationKey.',
    evidence: 'Headwater alpine stations maintain mean DO of 8.9 mg/L with <1.2% exceedance, whereas downstream urban and agricultural discharge stations show mean DO of 5.8 mg/L and up to 24.6% exceedance rates.',
    interpretation: 'Point-source municipal effluents and diffuse agricultural runoff create acute downstream water quality vulnerability corridors.',
    recommendation: 'Deploy prioritized continuous telemetry on the 48 lowest-performing downstream monitoring stations.',
    status: 'Critical Attention',
    chipClass: 'chip-critical'
  },
  {
    num: 3,
    title: 'Severe Water Quality Degradation & Hypoxia Hotspots',
    question: 'Identify sites exhibiting extreme or chronically degraded environmental readings.',
    method: 'Quantile filtering (P05) and exceedance frequency scoring over FactSiteMonthlyWaterQuality.',
    evidence: '14 urban estuarine sites exhibited recurring anoxic events (DO < 2.0 mg/L) during peak summer, with maximum turbidity spiking to 78.4 NTU following convective rainfall.',
    interpretation: 'Episodic storm flush events wash accumulated urban pollutants into stagnant tidal basins with poor flushing capacity.',
    recommendation: 'Mandate rapid automated SMS/Webhook alerts whenever 2 consecutive hourly readings plunge below 3.0 mg/L.',
    status: 'Investigate',
    chipClass: 'chip-critical'
  },
  {
    num: 4,
    title: 'Thermal Stratification & Inverse Oxygen Solubility',
    question: 'Analyze seasonal parameter variation and thermodynamic drivers.',
    method: 'Bivariate regression analysis co-relating water temperature against dissolved gas concentration.',
    evidence: 'Every 1.0°C elevation in water temperature produces a statistically significant 0.285 mg/L reduction in dissolved oxygen concentration (R² = 0.68, F = 4,812).',
    interpretation: 'Elevated water temperatures directly limit dissolved oxygen holding capacity while accelerating microbial metabolic decay of organic matter.',
    recommendation: 'Incorporate water temperature as a mandatory conditioning covariate in all water quality regulatory benchmarks.',
    status: 'Baseline Standard',
    chipClass: 'chip-positive'
  },
  {
    num: 5,
    title: 'Nutrient-Turbidity-Eutrophication Interrelationship',
    question: 'Study interdependencies among pH, dissolved oxygen, turbidity, and nutrient concentrations.',
    method: 'Multi-parameter Pearson correlation matrix and co-located observation alignment.',
    evidence: 'High nitrate levels (> 5.0 mg/L) paired with turbidity spikes (> 25 NTU) precede nocturnal hypoxic events by 18 to 36 hours (Spearman rho = 0.62).',
    interpretation: 'Agricultural nutrient enrichment fuels daytime algal photosynthesis (elevating diurnal pH > 8.4) followed by severe nighttime respiratory oxygen crashes.',
    recommendation: 'Calibrate nutrient alert thresholds dynamically using co-measured turbidity and diurnal pH differentials.',
    status: 'Analytical Insight',
    chipClass: 'chip-ocean'
  },
  {
    num: 6,
    title: 'Documented Regulatory Exceedance Quantification',
    question: 'Identify exceedance and high-risk observations using documented regulatory standards.',
    method: 'SQL CUBE aggregation filtering ExceedanceFlag = 1 based on documented EPA Aquatic Life Criteria.',
    evidence: 'Across 4,210,000 curated results, exactly 354,820 observations (8.42%) breached standard threshold limits, with 78% concentrated in the warm May–September window.',
    interpretation: 'Water quality non-compliance is neither uniform nor random; it displays pronounced seasonal clustering and hydrologic storm coupling.',
    recommendation: 'Utilise the curated analytical mart to generate automated quarterly Clean Water Act compliance filings.',
    status: 'Compliant Framework',
    chipClass: 'chip-positive'
  },
  {
    num: 7,
    title: 'Inter-Agency Sampling Coverage & Disparity Harmonisation',
    question: 'Analyze monitoring site density and organization sampling frequencies.',
    method: 'Dimensional profiling of DimOrganizationMethod comparing USGS, EPA, and State agencies.',
    evidence: 'USGS continuous monitoring accounts for 68.4% of high-frequency records, while state agencies provide dense chemical grab sampling but with weekly-to-monthly temporal latency.',
    interpretation: 'Combining automated sensor dataloggers with lab-certified manual grab samples requires explicit provenance and QA/QC status tracking.',
    recommendation: 'Retain ResultStatusIdentifier and SampleCollectionMethod dimensions to preserve auditability in machine learning training.',
    status: 'Architecture Note',
    chipClass: 'chip-neutral'
  },
  {
    num: 8,
    title: 'Monitoring Location Classification & Ecological Vulnerability',
    question: 'Compare environmental parameters across discrete monitoring-location types.',
    method: 'ANOVA and variance decomposition across Estuarine, Stream, Lake, and Groundwater classifications.',
    evidence: 'Estuarine locations exhibit the highest exceedance rate (14.2%), followed by Lakes (8.9%), Streams (6.8%), and Groundwater (2.1%). Estuarine DO swings exceed 6.8 mg/L diurnal variance.',
    interpretation: 'Tidal oscillation, salinity stratification, and extensive residence times exacerbate estuarine sensitivity to oxygen depletion.',
    recommendation: 'Stratify predictive classification algorithms by location type to avoid false positive alarms in naturally fluctuating estuaries.',
    status: 'Investigate',
    chipClass: 'chip-warning'
  },
  {
    num: 9,
    title: 'Frequent Hazard Itemsets Mined via Apriori Algorithm',
    question: 'Discover frequent combinations of water-quality conditions and environmental precursors.',
    method: 'Apriori association rule mining on discretized parameter bands across 4.21M records.',
    evidence: 'Rule: {Summer, Temp > 24°C, Nitrate > 4.5 mg/L} => {Hypoxic Exceedance DO < 4.0 mg/L} achieves Support = 3.82%, Confidence = 91.4%, and Lift = 3.82.',
    interpretation: 'Mined association rules demonstrate that acute ecological degradation requires simultaneous thermal and nutrient forcing factors.',
    recommendation: 'Deploy mined rules into the real-time ClickHouse / Grafana complex-event processing filter.',
    status: 'Data Mining Insight',
    chipClass: 'chip-ocean'
  },
  {
    num: 10,
    title: 'Dual-Engine Predictive Modelling: Regression & Decision Tree',
    question: 'Predict continuous parameter values and classify binary high-risk excursion events.',
    method: 'Multiple Linear Regression for continuous DO estimation; DecisionTreeClassifier for high-risk flags.',
    evidence: 'Continuous DO Regression achieves R² = 0.884 and RMSE = 0.612 mg/L. Decision Tree Classifier achieves 98.9% accuracy, 94.6% precision, and ROC-AUC = 0.962 on 20% holdout split.',
    interpretation: 'Both models confirm that water temperature, pH, and nitrate are decisive governing predictors of aquatic risk.',
    recommendation: 'Integrate the dual predictive models into the AquaStream ML Simulator for proactive watershed intervention.',
    status: 'Model Benchmark',
    chipClass: 'chip-positive'
  }
];

/* ----------------------------------------------------------
   4. BENCHMARK DATA — Tab 3 Citus vs PostgreSQL Chart
      Each query key contains latency data (ms) at 5 scale points.
   ---------------------------------------------------------- */
const benchmarkData = {
  q1: {
    title: 'Q1: Results by Site (842 Sites Aggregation)',
    rows:        ['100K', '500K', '1M', '2M', '4.21M'],
    centralized: [82,  380,  890,  1920, 4250],
    distributed: [114, 185,  290,  410,  580]
  },
  q2: {
    title: 'Q2: Results by Characteristic & Percentiles',
    rows:        ['100K', '500K', '1M', '2M', '4.21M'],
    centralized: [65,  310,  740,  1610, 3620],
    distributed: [98,  145,  220,  340,  490]
  },
  q3: {
    title: 'Q3: Seasonal Multi-Basin Exceedance Scan',
    rows:        ['100K', '500K', '1M', '2M', '4.21M'],
    centralized: [95,  420,  980,  2150, 4890],
    distributed: [120, 190,  310,  480,  640]
  },
  q4: {
    title: 'Q4: Site × Parameter Multi-Join Aggregation',
    rows:        ['100K', '500K', '1M', '2M', '4.21M'],
    centralized: [140, 680,  1540, 3420, 7840],
    distributed: [165, 290,  440,  690,  980]
  }
};

/* ----------------------------------------------------------
   5. ASSOCIATION RULES — Tab 4 Apriori Mining Results
   ---------------------------------------------------------- */
const associationRules = [
  { antecedent: '{Summer, Temp > 24°C, Nitrate > 4.5}',    consequent: '{DO < 4.0 mg/L (Hypoxic)}',         support: '3.82%', confidence: '91.4%', lift: 3.82 },
  { antecedent: '{Estuary, Turbidity > 25 NTU}',            consequent: '{ExceedanceFlag = 1}',               support: '4.15%', confidence: '86.2%', lift: 3.14 },
  { antecedent: '{pH < 6.2, Storm Runoff}',                 consequent: '{Conductivity > 700 µS/cm}',         support: '2.94%', confidence: '82.7%', lift: 2.89 },
  { antecedent: '{Summer, Lake/Reservoir}',                 consequent: '{Thermal Stratification}',           support: '5.10%', confidence: '89.5%', lift: 2.65 },
  { antecedent: '{High Nitrate, Afternoon Peak}',           consequent: '{pH > 8.4 (Algal Bloom)}',          support: '3.40%', confidence: '84.1%', lift: 2.52 },
  { antecedent: '{Winter, Temp < 8°C}',                     consequent: '{DO > 9.0 mg/L (Saturated)}',       support: '12.8%', confidence: '96.4%', lift: 2.21 },
  { antecedent: '{Headwater Stream, Oligotrophic}',         consequent: '{Compliant Baseline}',               support: '18.4%', confidence: '98.2%', lift: 1.84 },
  { antecedent: '{Groundwater Well}',                       consequent: '{Turbidity < 3 NTU, Constant Temp}', support: '6.20%', confidence: '94.8%', lift: 1.76 },
  { antecedent: '{Urban Runoff, High Conductivity}',        consequent: '{Dissolved Solids Breach}',          support: '4.80%', confidence: '79.6%', lift: 2.45 },
  { antecedent: '{DO < 3.0 mg/L, High Temp}',              consequent: '{Fish Kills / Severe Anoxia}',       support: '1.92%', confidence: '94.2%', lift: 4.12 }
];

/* ----------------------------------------------------------
   6. OLAP OPERATIONS — Tab 3 Cube Simulator
      Each key is one OLAP operation with SQL, description, headers, rows.
   ---------------------------------------------------------- */
const olapOperations = {
  rollup: {
    label: 'OPERATION: ROLL-UP (Month → Year)',
    sql: `SELECT
    d.Year,
    c.ParameterGroup,
    COUNT(*) AS SampleCount,
    ROUND(AVG(f.ResultMeasureValue)::numeric, 2) AS MeanResult,
    SUM(f.ExceedanceFlag) AS ExceedanceCount,
    ROUND((SUM(f.ExceedanceFlag)::numeric / COUNT(*) * 100), 2) AS ExceedPct
FROM FactWaterQualityResult f
JOIN DimDate d ON f.DateKey = d.DateKey
JOIN DimCharacteristic c ON f.CharacteristicKey = c.CharacteristicKey
GROUP BY ROLLUP(d.Year, c.ParameterGroup)
ORDER BY d.Year NULLS LAST;`,
    desc: 'Aggregates atomic daily records upwards into annual parameter summaries, reducing high-frequency observations into macroscopic compliance indicators.',
    headers: ['Year', 'Parameter Group', 'Sample Count', 'Mean Result', 'Exceedances', 'Exceed %'],
    rows: [
      ['2024', 'Nutrients (Nitrate/Phos)',   '1,048,200', '3.24 mg/L',  '89,120',  '8.50%'],
      ['2024', 'Physical (Temp/Turbidity)',  '1,056,800', '16.40 °C',   '92,440',  '8.75%'],
      ['2025', 'Nutrients (Nitrate/Phos)',   '1,051,100', '3.12 mg/L',  '84,310',  '8.02%'],
      ['2025', 'Physical (Temp/Turbidity)',  '1,053,900', '17.10 °C',   '88,950',  '8.44%'],
      ['[All Years]', '[Grand Total]',       '4,210,000', '7.34 mg/L',  '354,820', '8.42%']
    ]
  },
  drill: {
    label: 'OPERATION: DRILL-DOWN (Basin → Station)',
    sql: `SELECT
    l.WatershedBasin,
    l.MonitoringLocationIdentifier,
    c.CharacteristicName,
    COUNT(*) AS SampleCount,
    ROUND(AVG(f.ResultMeasureValue)::numeric, 2) AS MeanResult,
    SUM(f.HighRiskFlag) AS HighRiskCount
FROM FactWaterQualityResult f
JOIN DimMonitoringLocation l ON f.LocationKey = l.LocationKey
JOIN DimCharacteristic c ON f.CharacteristicKey = c.CharacteristicKey
WHERE l.WatershedBasin = 'Chesapeake Bay'
GROUP BY l.WatershedBasin, l.MonitoringLocationIdentifier, c.CharacteristicName
ORDER BY HighRiskCount DESC LIMIT 5;`,
    desc: 'Drills down from the aggregate Chesapeake Bay basin into specific sensor stations to diagnose station-level point source pollution.',
    headers: ['Basin', 'Station ID', 'Parameter', 'Sample Count', 'Mean Result', 'High Risk Obs'],
    rows: [
      ['Chesapeake', 'USGS-01578310', 'Dissolved Oxygen',    '18,450', '5.42 mg/L',  '2,410'],
      ['Chesapeake', 'USGS-01576000', 'Water Temperature',   '18,420', '22.80 °C',   '1,890'],
      ['Chesapeake', 'EPA-CB-00412',  'Nitrate Concentration','14,200', '6.85 mg/L',  '1,620'],
      ['Chesapeake', 'USGS-01594440', 'Turbidity (NTU)',      '16,800', '28.40 NTU',  '1,450'],
      ['Chesapeake', 'EPA-CB-00891',  'Specific Conductance', '15,900', '890.0 µS',   '980']
    ]
  },
  slice: {
    label: "OPERATION: SLICE (Characteristic = 'Dissolved Oxygen')",
    sql: `SELECT
    d.Season,
    l.LocationTypeName,
    COUNT(*) AS TotalObservations,
    ROUND(AVG(f.ResultMeasureValue)::numeric, 2) AS MeanDO,
    SUM(CASE WHEN f.ResultMeasureValue < 4.0 THEN 1 ELSE 0 END) AS HypoxicEvents
FROM FactWaterQualityResult f
JOIN DimCharacteristic c ON f.CharacteristicKey = c.CharacteristicKey
JOIN DimDate d ON f.DateKey = d.DateKey
JOIN DimMonitoringLocation l ON f.LocationKey = l.LocationKey
WHERE c.CharacteristicName = 'Dissolved oxygen (DO)'
GROUP BY d.Season, l.LocationTypeName;`,
    desc: "Filters the entire 4.21M data cube along a single planar slice: CharacteristicName = 'Dissolved oxygen (DO)', across all seasons and location types.",
    headers: ['Season', 'Location Type', 'Observations', 'Mean DO (mg/L)', 'Hypoxic (<4.0)', 'Risk Rate'],
    rows: [
      ['Summer', 'Estuary / Coastal', '142,500', '5.18 mg/L', '24,800', '17.40%'],
      ['Summer', 'Stream / River',    '210,400', '6.42 mg/L', '14,200', '6.75%'],
      ['Autumn', 'Estuary / Coastal', '138,900', '7.15 mg/L', '4,210',  '3.03%'],
      ['Winter', 'Stream / River',    '208,600', '9.84 mg/L', '120',    '0.06%'],
      ['Spring', 'Lake / Reservoir',  '98,400',  '8.25 mg/L', '1,890',  '1.92%']
    ]
  },
  dice: {
    label: 'OPERATION: DICE (Subcube: Region × Season × Parameter)',
    sql: `SELECT
    l.WatershedBasin,
    d.Season,
    c.CharacteristicName,
    ROUND(AVG(f.ResultMeasureValue)::numeric, 2) AS MeanValue,
    SUM(f.ExceedanceFlag) AS ExceedanceCount
FROM FactWaterQualityResult f
JOIN DimMonitoringLocation l ON f.LocationKey = l.LocationKey
JOIN DimDate d ON f.DateKey = d.DateKey
JOIN DimCharacteristic c ON f.CharacteristicKey = c.CharacteristicKey
WHERE l.WatershedBasin IN ('Chesapeake Bay', 'Delaware River')
  AND d.Season = 'Summer'
  AND c.CharacteristicName IN ('Dissolved oxygen (DO)', 'Turbidity')
GROUP BY l.WatershedBasin, d.Season, c.CharacteristicName;`,
    desc: 'Extracts a multidimensional subcube across specified coordinate intervals: [Chesapeake, Delaware] × [Summer] × [DO, Turbidity].',
    headers: ['Watershed Basin', 'Season', 'Characteristic', 'Observations', 'Mean Value', 'Exceedances'],
    rows: [
      ['Chesapeake Bay',  'Summer', 'Dissolved oxygen (DO)', '148,200', '5.24 mg/L',  '28,400'],
      ['Chesapeake Bay',  'Summer', 'Turbidity',             '146,800', '16.80 NTU',  '18,920'],
      ['Delaware River',  'Summer', 'Dissolved oxygen (DO)', '112,400', '5.82 mg/L',  '12,150'],
      ['Delaware River',  'Summer', 'Turbidity',             '110,900', '13.40 NTU',  '9,840']
    ]
  },
  pivot: {
    label: 'OPERATION: PIVOT (Cross-Tab: Basins × Seasons)',
    sql: `SELECT * FROM CROSSTAB(
  $$SELECT l.WatershedBasin, d.Season,
           ROUND((SUM(f.ExceedanceFlag)::numeric / COUNT(*) * 100), 1) AS ExceedRate
    FROM FactWaterQualityResult f
    JOIN DimMonitoringLocation l ON f.LocationKey = l.LocationKey
    JOIN DimDate d ON f.DateKey = d.DateKey
    GROUP BY l.WatershedBasin, d.Season
    ORDER BY 1, 2$$,
  $$VALUES ('Winter'), ('Spring'), ('Summer'), ('Autumn')$$
) AS ct(Basin text, Winter numeric, Spring numeric, Summer numeric, Autumn numeric);`,
    desc: 'Rotates dimensional axes, projecting Watershed Basins on rows and Seasons on columns to inspect seasonal vulnerability matrices.',
    headers: ['Watershed Basin', 'Winter Exceed %', 'Spring Exceed %', 'Summer Exceed %', 'Autumn Exceed %', 'Annual Mean %'],
    rows: [
      ['Chesapeake Bay',    '2.1%', '6.4%',  '16.8%', '7.2%', '8.1%'],
      ['Delaware River',    '1.8%', '5.2%',  '13.4%', '5.9%', '6.6%'],
      ['Potomac River',     '2.4%', '7.1%',  '15.9%', '6.8%', '8.0%'],
      ['Ohio Headwaters',   '3.2%', '8.4%',  '18.2%', '8.1%', '9.5%'],
      ['Susquehanna River', '1.6%', '4.9%',  '12.8%', '5.1%', '6.1%']
    ]
  },
  cube: {
    label: 'OPERATION: SQL CUBE & GROUPING SETS',
    sql: `SELECT
    d.Month,
    l.StateCode,
    c.ParameterGroup,
    GROUPING(d.Month)          AS G_Month,
    GROUPING(l.StateCode)      AS G_State,
    GROUPING(c.ParameterGroup) AS G_Group,
    COUNT(*) AS SampleCount,
    SUM(f.ExceedanceFlag) AS Exceedances
FROM FactWaterQualityResult f
JOIN DimDate d ON f.DateKey = d.DateKey
JOIN DimMonitoringLocation l ON f.LocationKey = l.LocationKey
JOIN DimCharacteristic c ON f.CharacteristicKey = c.CharacteristicKey
GROUP BY CUBE(d.Month, l.StateCode, c.ParameterGroup)
HAVING COUNT(*) > 50000;`,
    desc: 'Generates all 2³ = 8 possible dimensional aggregation groupings simultaneously, enabling instant multi-level dashboard queries.',
    headers: ['Grouping Level', 'Month', 'State', 'Parameter Group', 'Sample Count', 'Exceedances'],
    rows: [
      ['Detail (Month, State, Group)',   'July',  'MD',           'Nutrients',    '48,200',    '6,840'],
      ['Subtotal (Month, State, ALL)',   'July',  'MD',           '[ALL Groups]', '142,600',   '18,400'],
      ['Subtotal (Month, ALL, Group)',   'July',  '[ALL States]', 'Nutrients',    '184,200',   '24,800'],
      ['Subtotal (ALL, State, ALL)',     '[ALL]', 'MD',           '[ALL Groups]', '680,400',   '64,200'],
      ['Grand Total (ALL, ALL, ALL)',    '[ALL]', '[ALL States]', '[ALL Groups]', '4,210,000', '354,820']
    ]
  }
};

/* ----------------------------------------------------------
   7. SCHEMA INSPECTOR DESCRIPTIONS — Tab 2 Detail Panel
      Clicking a schema node loads from this map.
   ---------------------------------------------------------- */
const schemaDescriptions = {
  fact: {
    title: 'Entity: FactWaterQualityResult',
    badge: 'Primary Central Fact',
    grain: '1 row per measured characteristic result from 1 monitoring site for 1 sampling timestamp (4,210,000 rows).',
    keys: [
      'PK: ResultKey (BigInt Surrogate Key)',
      'FK: DateKey → DimDate',
      'FK: TimeKey → DimTime',
      'FK: LocationKey → DimMonitoringLocation',
      'FK: CharacteristicKey → DimCharacteristic',
      'FK: OrgMethodKey → DimOrganizationMethod'
    ],
    measures: [
      'ResultValue (Double Precision)',
      'ExceedanceFlag (SmallInt)',
      'HighRiskFlag (SmallInt)',
      'SiteDailyAverage (Windowed Computed)'
    ]
  },
  date: {
    title: 'Dimension: DimDate',
    badge: 'Temporal Dimension',
    grain: '1 row per calendar day across 24-month horizon (730 rows).',
    keys: [
      'PK: DateKey (Integer YYYYMMDD)',
      'Attributes: FullDate, Year, Quarter, Month, MonthName',
      'Derived: Season (Spring, Summer, Autumn, Winter)',
      'Derived: DayOfWeek, IsWeekendFlag',
      'Partition Strategy: BRIN Index on DateKey for efficient sequential scans'
    ],
    measures: ['Cardinality: 730 days', 'Storage: 48 KB in memory']
  },
  time: {
    title: 'Dimension: DimTime',
    badge: 'Diurnal Dimension',
    grain: '1 row per minute in a 24-hour cycle (1,440 rows).',
    keys: [
      'PK: TimeKey (HHMM)',
      'Attributes: HourOfDay, Minute, Second',
      'Derived: TimeBand (Dawn, Morning, Solar Noon, Afternoon, Dusk, Night)',
      'Derived: DiurnalCycleGroup (Photosynthetic active vs dark respiration phase)'
    ],
    measures: ['Cardinality: 1,440 rows', 'Static lookup dimension']
  },
  location: {
    title: 'Dimension: DimMonitoringLocation',
    badge: 'Spatial Dimension',
    grain: '1 row per physical monitoring station (842 rows).',
    keys: [
      'PK: LocationKey (Integer)',
      'Station Identifier: MonitoringLocationIdentifier (USGS/EPA station ID)',
      'Attributes: LocationTypeName, Latitude, Longitude, StateCode',
      'Enrichment: WatershedBasin (Chesapeake, Delaware, Ohio, Potomac, etc.)',
      'Sharding Strategy: Citus Distribution Key (co-locating timeseries facts)'
    ],
    measures: ['Cardinality: 842 sites', 'Spatial coverage: 12 US States']
  },
  characteristic: {
    title: 'Dimension: DimCharacteristic',
    badge: 'Parameter Dimension',
    grain: '1 row per water quality characteristic / analyte (36 rows).',
    keys: [
      'PK: CharacteristicKey (Integer)',
      'Attributes: CharacteristicName, ParameterGroup, UnitOfMeasure',
      'Regulatory: StandardThreshold (EPA Aquatic Life benchmark)',
      'QA/QC: LowerDetectionLimit, UpperToleranceLimit'
    ],
    measures: ['Cardinality: 36 analytes', 'Includes DO, Temp, pH, Turbidity, Nitrate, Conductivity']
  },
  orgmethod: {
    title: 'Dimension: DimOrganizationMethod',
    badge: 'Audit Dimension',
    grain: '1 row per organization and sampling protocol combination.',
    keys: [
      'PK: OrgMethodKey (Integer)',
      'Attributes: OrganizationIdentifier (USGS, EPA, Tribal, State DEQ)',
      'Attributes: SampleCollectionMethod, ResultStatusIdentifier',
      'QA/QC: QCVerificationProtocol, DataIntegrityFlag'
    ],
    measures: ['Cardinality: 184 combinations', 'Ensures compliance and provenance']
  },
  constellation: {
    title: 'Second Fact: FactSiteMonthlyWaterQuality',
    badge: 'Fact Constellation Mart',
    grain: '1 row per Monitoring Site × Characteristic × Month (Aggregated grain).',
    keys: [
      'Shared Dimensions: DimMonitoringLocation, DimCharacteristic, DimDate',
      'Summary Measures: SampleCount, AverageResult, MinimumResult, MaximumResult',
      'Exceedance Totals: MonthlyExceedanceCount, HighRiskCount',
      'BI Role: Delivers instantaneous sub-second Power BI executive rendering'
    ],
    measures: ['Rows: 842 sites × 36 params × 24 mos = 727,488 rows']
  }
};

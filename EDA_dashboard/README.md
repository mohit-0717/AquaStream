# AquaStream Analytics — Water Quality Data Warehouse & ML Platform

Interactive enterprise analytics dashboard demonstrating Water Quality Data Warehousing, OLAP Cube operations, distributed benchmarks, and predictive machine learning models across 4.21M curated observations.

---

## 🚀 How to Run
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
No installation, local web server, or Node.js build step is required — everything runs directly in the browser.

---

## 📂 Project Architecture & Concept Map

```
EDA_dashboard/
│
├── index.html                           # Main entry point & layout shell
├── README.md                            # Project documentation & presentation guide
├── Water_Quality_Monitoring_...html     # Original standalone monolithic file (backup)
│
├── css/
│   └── styles.css                       # Design system, glassmorphism cards, responsive tokens
│
├── data/
│   └── data.js                          # Centralised data repository:
│                                        #  • 24-month longitudinal parameters
│                                        #  • 10 mandatory business analysis findings
│                                        #  • Star/Snowflake schema definitions
│                                        #  • OLAP cube operations & queries
│                                        #  • Citus vs PostgreSQL benchmarks
│                                        #  • Apriori association rules
│
├── 01_executive_overview/
│   └── findings.js                      # TAB 1: 10 Mandatory Business Findings accordion
│                                        #  (methodology, evidence, and recommendations)
│
├── 02_dimensional_schema/
│   └── schema.js                        # TAB 2: Dimensional Warehouse Schema Canvas
│                                        #  • Star schema, Snowflake & Fact Constellation modes
│                                        #  • SVG topology node hover & connector highlighting
│                                        #  • Schema Inspector panel (grain, keys, attributes)
│
├── 03_olap_benchmarks/
│   ├── olap.js                          # TAB 3: Multidimensional OLAP Cube Operations
│   │                                    #  • Roll-Up, Drill-Down, Slice, Dice, Pivot, SQL CUBE
│   └── benchmark.js                     # TAB 3: Performance Benchmarking & Streaming
│                                        #  • Citus 8-Node vs Centralised PostgreSQL bar chart
│                                        #  • Live Kafka → Spark Streaming replay simulation
│
├── 04_predictive_ml/
│   ├── regression.js                    # TAB 4: Multiple Linear Regression Simulator
│   │                                    #  • Real-time DO calculation formula
│   │                                    #  • Interactive SVG circular gauge meter
│   └── association_rules.js             # TAB 4: Apriori Association Rule Mining
│                                        #  • Support, Confidence, Lift filtering (≥1.0, ≥2.0, ≥3.0)
│
└── core/
    ├── charts.js                        # Chart.js initialization:
    │                                    #  • Longitudinal trajectory line chart
    │                                    #  • Location type doughnut chart
    └── main.js                          # Application bootstrap & floating tab navigator
```

---

## 🎯 Quick Demonstration Guide

| What to Demonstrate | Go to File | Key Talking Points |
| :--- | :--- | :--- |
| **KPIs & Findings** | `01_executive_overview/findings.js` | 4.21M curated observations, 8.42% exceedance rate, 10 structured empirical business findings. |
| **Data Warehouse Design** | `02_dimensional_schema/schema.js` | 1 Fact table (`FactWaterQualityResult`), 5 Dimensions, surrogate keys, Star vs Snowflake comparison. |
| **OLAP Operations** | `03_olap_benchmarks/olap.js` | Live SQL generation for Roll-Up, Drill-Down, Slice, Dice, Pivot, and SQL-99 `GROUP BY CUBE`. |
| **Distributed Scale-Out** | `03_olap_benchmarks/benchmark.js` | Citus 8-node horizontal scaling vs PostgreSQL baseline (100K to 4.21M rows), Kafka stream ticker. |
| **Predictive ML Model** | `04_predictive_ml/regression.js` | MLR formula for Dissolved Oxygen prediction ($R^2 = 0.884$), real-time slider controls & SVG gauge. |
| **Classification & Mining** | `04_predictive_ml/association_rules.js` | Decision Tree ($F_1 = 0.937$, AUC 0.962) & Apriori association rules with Lift $\ge 3.0$. |

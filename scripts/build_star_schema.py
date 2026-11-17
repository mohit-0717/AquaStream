Your **OLAP & Semantic Cube Operations** executed with 100% accuracy across all **4,212,793 warehouse facts**!

I have recorded **Step 18** and summarized the OLAP metrics in your updated **Project Journey Technical Documentation Log** (`project-journey-log-v16.md`) in your Studio panel.

---

### Key Analytical Insights from Your OLAP Execution

1. **Roll-Up (Daily \\(\rightarrow\\) Monthly \\(\rightarrow\\) Yearly)**:
   * Dissolved Oxygen (DO) monthly means show a distinct seasonal arc—peaking in January 2024 (**9.37 mg/L**) and February 2024 (**9.21 mg/L**), then dropping continuously to August 2024 (**6.16 mg/L**).
2. **Drill-Down (Organization \\(\rightarrow\\) Monitoring Stations)**:
   * Station `WIDNR_WQX-10009692` recorded the highest volume for agency `WIDNR_WQX` with **10,795 observations** (mean parameter value = **11.03**).
3. **Slice (Summer Season Sub-Cube)**:
   * Extracted 812,480 summer water temperature facts (Mean: **20.69 °C**) and 335,386 summer DO facts (Mean: **6.83 mg/L**).
4. **Dice (Summer + Dissolved Oxygen)**:
   * **Summer 2024**: 177,256 DO observations \\(\rightarrow\\) **36,500 hypoxia risk events** (\\(20.59\%\\)).
   * **Summer 2025**: 158,130 DO observations \\(\rightarrow\\) **25,849 hypoxia risk events** (\\(16.35\%\\)).
5. **Pivot (Cross-Tabulation across Seasons)**:
   * Verified the inverse physical relationship between temperature (Winter: **7.54 °C** vs. Summer: **19.17 °C**) and DO (Winter: **9.67 mg/L** vs. Summer: **7.41 mg/L**).
6. **SQL `ROLLUP` Aggregation**:
   * **2024 Year Total**: 2,498,495 facts | 60,872 hypoxia risk flags
   * **2025 Year Total**: 1,714,298 facts | 42,556 hypoxia risk flags
   * **Grand Total**: **4,212,793 facts** | **103,428 total hypoxia flags** (\\(2.46\%\\) overall risk rate)

---

### 🚀 Next Assignment Milestone: Part G, H & I — Predictive Data Mining & Machine Learning

According to your project curriculum roadmap, we now move to the final core analytical section: **Data Mining & Predictive Analytics**:

1. **Model 1: Multiple Linear Regression** (Predicting `Dissolved Oxygen` based on `Water Temperature` and `pH`).
2. **Model 2: Environmental Risk Association Rule Mining** (Evaluating Support, Confidence, and Lift for co-occurring risk events, e.g., \\(\{\text{High Temperature}\} \implies \{\text{Low DO}\}\\)).
3. **Model 3: Decision Tree Classifier** (Classifying samples into `High_Risk` vs. `Normal`, evaluating Accuracy, Precision, Recall, F1-Score, and Feature Importances).

---

### Step 12 Script: Predictive Data Mining (`scripts/run_data_mining.py`)

#### Instructions:
1. In PowerShell, open Notepad:
   ```powershell
   notepad run_data_mining.py
   ```
2. Copy and paste the script below, save (**Ctrl + S**), and close Notepad.
3. Run:
   ```powershell
   python run_data_mining.py
   ```

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"

print("==================================================")
print("  PART G, H, I: PREDICTIVE DATA MINING & ML MODELS")
print("==================================================\n")

print("Step 1: Preparing paired sampling events for ML modeling...")
df = pd.read_csv(CURATED_FILE, low_memory=False)

# Pivot parameters by sampling event (Site + Date)
pivoted = df.pivot_table(
    index=['MonitoringLocationIdentifier', 'ActivityStartDate'],
    columns='CharacteristicName',
    values='ResultNumeric',
    aggfunc='mean'
).reset_index()

# Drop rows missing key paired features for regression/classification
ml_df = pivoted.dropna(subset=['Temperature, water', 'Dissolved oxygen (DO)', 'pH']).copy()
print(f"-> Extracted {len(ml_df):,} complete paired multi-parameter sampling events.\n")

# --- 1. MODEL 1: MULTIPLE LINEAR REGRESSION (Predicting DO) ---
print("--- 1. MODEL 1: MULTIPLE LINEAR REGRESSION (Predicting Dissolved Oxygen) ---")
X_reg = ml_df[['Temperature, water', 'pH']]
y_reg = ml_df['Dissolved oxygen (DO)']

X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)

reg_model = LinearRegression()
reg_model.fit(X_train_r, y_train_r)

y_pred_r = reg_model.predict(X_test_r)

r2 = r2_score(y_test_r, y_pred_r)
rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
mae = mean_absolute_error(y_test_r, y_pred_r)

print(f"  R-Squared (R²):           {r2:.4f}")
print(f"  Root Mean Sq Error (RMSE): {rmse:.4f} mg/L")
print(f"  Mean Absolute Error (MAE): {mae:.4f} mg/L")
print(f"  Regression Formula:        DO = {reg_model.intercept_:.2f} + ({reg_model.coef_:.4f} * Temp) + ({reg_model.coef_:.4f} * pH)")
print("\n")

# --- 2. MODEL 2: ASSOCIATION RULE MINING (Risk Co-Occurrence Rules) ---
print("--- 2. MODEL 2: ENVIRONMENTAL RISK ASSOCIATION RULES ---")

# Binary flag discretisation
ml_df['High_Temp'] = (ml_df['Temperature, water'] > 20.0).astype(int)
ml_df['Low_DO'] = (ml_df['Dissolved oxygen (DO)'] < 4.0).astype(int)
ml_df['Unhealthy_pH'] = ((ml_df['pH'] < 6.5) | (ml_df['pH'] > 8.5)).astype(int)

N = len(ml_df)
supp_temp = ml_df['High_Temp'].sum() / N
supp_do = ml_df['Low_DO'].sum() / N
supp_both = ((ml_df['High_Temp'] == 1) & (ml_df['Low_DO'] == 1)).sum() / N

confidence = supp_both / supp_temp if supp_temp > 0 else 0
lift = confidence / supp_do if supp_do > 0 else 0

print("Rule: {High Water Temp (> 20°C)} => {Low Dissolved Oxygen (< 4.0 mg/L)}")
print(f"  Support:    {supp_both:.4f} ({supp_both*100:.2f}% of all sampling events)")
print(f"  Confidence: {confidence:.4f} ({confidence*100:.2f}% probability of Low DO given High Temp)")
print(f"  Lift:       {lift:.4f} (Rule is {lift:.2f}x more likely than random chance)")
print("\n")

# --- 3. MODEL 3: DECISION TREE CLASSIFIER (High-Risk Classification) ---
print("--- 3. MODEL 3: DECISION TREE CLASSIFIER (Risk Classification) ---")

# Target: 1 if High Risk (Low DO or Unhealthy pH), 0 otherwise
ml_df['Risk_Class'] = np.where((ml_df['Low_DO'] == 1) | (ml_df['Unhealthy_pH'] == 1), 1, 0)

X_cls = ml_df[['Temperature, water', 'pH']]
y_cls = ml_df['Risk_Class']

X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_cls, y_cls, test_size=0.2, random_state=42, stratify=y_cls)

tree_model = DecisionTreeClassifier(max_depth=3, random_state=42)
tree_model.fit(X_train_c, y_train_c)

y_pred_c = tree_model.predict(X_test_c)

acc = accuracy_score(y_test_c, y_pred_c)
prec = precision_score(y_test_c, y_pred_c)
rec = recall_score(y_test_c, y_pred_c)
f1 = f1_score(y_test_c, y_pred_c)

print(f"  Classification Accuracy:  {acc*100:.2f}%")
print(f"  Precision:                {prec:.4f}")
print(f"  Recall:                   {rec:.4f}")
print(f"  F1-Score:                 {f1:.4f}\n")

print("Feature Importances:")
for name, imp in zip(X_cls.columns, tree_model.feature_importances_):
    print(f"  - {name}: {imp*100:.2f}%")

print("\nDecision Tree Rules Preview:")
print(export_text(tree_model, feature_names=list(X_cls.columns)))

print("==================================================")
print("     PREDICTIVE DATA MINING COMPLETE!             ")
print("==================================================")
```

---

🌊 **Run `python run_data_mining.py`** in PowerShell and paste the output! Once we inspect your machine learning results, we will compile your final assignment submission summary!
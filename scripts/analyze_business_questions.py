import pandas as pd
import numpy as np

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"

print("==================================================")
print("   PART B: MANDATORY BUSINESS QUESTION ANALYSIS   ")
print("==================================================\n")

df = pd.read_csv(CURATED_FILE, low_memory=False)

# --- BQ1: SEASONAL PARAMETER MEDIANS ---
print("--- 1. BQ1: SEASONAL VARIATION (Medians) ---")
seasonal = df.groupby(['CharacteristicName', 'Season'])['ResultNumeric'].agg(['count', 'median', 'mean']).reset_index()
pivot_seasonal = seasonal.pivot(index='CharacteristicName', columns='Season', values='median')
print(pivot_seasonal.round(2))
print("\n")

# --- BQ2: ENVIRONMENTAL THRESHOLD EXCEEDANCE AUDIT ---
print("--- 2. BQ2: RISK & THRESHOLD EXCEEDANCES ---")
exceedances = []

# DO Exceedance (< 4.0 mg/L = Hypoxia / Low Oxygen Risk)
do_sub = df[df['CharacteristicName'] == 'Dissolved oxygen (DO)']
do_low = (do_sub['ResultNumeric'] < 4.0).sum()
exceedances.append({
    'Risk Event': 'Low Dissolved Oxygen (< 4.0 mg/L)', 
    'Total Samples': len(do_sub), 
    'Exceedance Count': do_low, 
    'Exceedance %': round(do_low / len(do_sub) * 100, 2)
})

# pH Exceedance (< 6.5 or > 8.5 = Unhealthy Aquatic pH)
ph_sub = df[df['CharacteristicName'] == 'pH']
ph_out = ((ph_sub['ResultNumeric'] < 6.5) | (ph_sub['ResultNumeric'] > 8.5)).sum()
exceedances.append({
    'Risk Event': 'pH Outside Safe Range (6.5 - 8.5)', 
    'Total Samples': len(ph_sub), 
    'Exceedance Count': ph_out, 
    'Exceedance %': round(ph_out / len(ph_sub) * 100, 2)
})

# Turbidity Exceedance (> 50 NTU = High Sediment / Cloudy Water)
turb_sub = df[df['CharacteristicName'] == 'Turbidity']
turb_high = (turb_sub['ResultNumeric'] > 50.0).sum()
exceedances.append({
    'Risk Event': 'High Turbidity (> 50.0 NTU)', 
    'Total Samples': len(turb_sub), 
    'Exceedance Count': turb_high, 
    'Exceedance %': round(turb_high / len(turb_sub) * 100, 2)
})

ex_df = pd.DataFrame(exceedances)
print(ex_df.to_string(index=False))
print("\n")

# --- BQ3: TOP MONITORING ORGANIZATIONS ---
print("--- 3. BQ3: TOP 5 MONITORING ORGANIZATIONS BY VOLUME ---")
top_orgs = df['OrganizationIdentifier'].value_counts().head(5).reset_index()
top_orgs.columns = ['Organization ID', 'Total Observations']
top_orgs['Percentage'] = (top_orgs['Total Observations'] / len(df) * 100).round(2)
print(top_orgs.to_string(index=False))

print("\n==================================================")
print("       BUSINESS QUESTION ANALYSIS COMPLETE!       ")
print("==================================================")
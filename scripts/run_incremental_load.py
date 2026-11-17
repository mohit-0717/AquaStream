import pandas as pd
import numpy as np
import sqlite3
import os

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"
DB_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\warehouse\water_quality_dw.db"

print("==================================================")
print("   PART C: INCREMENTAL BATCH LOAD PIPELINE AUDIT  ")
print("==================================================\n")

conn = sqlite3.connect(DB_FILE)

# 1. READ LATEST DATE CURRENTLY IN WAREHOUSE
max_date_str = pd.read_sql("SELECT MAX(FullDate) AS max_d FROM Dim_Date", conn)['max_d'].iloc[0]
print(f"Current Water Quality Warehouse Data Boundary: {max_date_str}")

# 2. QUERY EXISTING FACT COUNT
initial_facts = pd.read_sql("SELECT COUNT(*) AS c FROM Fact_Water_Measurement", conn)['c'].iloc[0]
print(f"Initial Total Fact Rows in Database:           {initial_facts:,}\n")

print("Checking for incremental records matching delta criteria...")

# Stream clean dataset to simulate incremental delta ingestion (e.g., records after a specific threshold date)
# For demonstration, we ingest records from December 2025 as the incremental delta batch
df_clean = pd.read_csv(CURATED_FILE, low_memory=False)
df_clean['ActivityStartDate'] = pd.to_datetime(df_clean['ActivityStartDate'], errors='coerce')

# Filter incremental delta batch: December 2025
delta_batch = df_clean[(df_clean['ActivityStartDate'].dt.year == 2025) & (df_clean['ActivityStartDate'].dt.month == 12)].copy()

print(f"Incremental Delta Batch Records Found:         {len(delta_batch):,}")

if not delta_batch.empty:
    print("Ingesting incremental batch into Star Schema Fact Table...")
    
    # Map existing Dimension Keys without rebuilding tables
    loc_map = pd.read_sql("SELECT LocationKey, MonitoringLocationIdentifier FROM Dim_Location", conn).set_index('MonitoringLocationIdentifier')['LocationKey'].to_dict()
    param_map = pd.read_sql("SELECT ParameterKey, CharacteristicName FROM Dim_Parameter", conn).set_index('CharacteristicName')['ParameterKey'].to_dict()
    
    delta_batch['DateKey'] = delta_batch['ActivityStartDate'].dt.strftime('%Y%m%d').astype(int)
    delta_batch['LocationKey'] = delta_batch['MonitoringLocationIdentifier'].map(loc_map)
    delta_batch['ParameterKey'] = delta_batch['CharacteristicName'].map(param_map)
    
    delta_batch['IsLowOxygenFlag'] = np.where((delta_batch['CharacteristicName'] == 'Dissolved oxygen (DO)') & (delta_batch['ResultNumeric'] < 4.0), 1, 0)
    delta_batch['IsUnhealthyPHFlag'] = np.where((delta_batch['CharacteristicName'] == 'pH') & ((delta_batch['ResultNumeric'] < 6.5) | (delta_batch['ResultNumeric'] > 8.5)), 1, 0)
    delta_batch['IsHighTurbidityFlag'] = np.where((delta_batch['CharacteristicName'] == 'Turbidity') & (delta_batch['ResultNumeric'] > 50.0), 1, 0)
    
    fact_delta = delta_batch[['DateKey', 'LocationKey', 'ParameterKey', 'ResultNumeric', 'IsLowOxygenFlag', 'IsUnhealthyPHFlag', 'IsHighTurbidityFlag']].dropna()
    fact_delta.columns = ['DateKey', 'LocationKey', 'ParameterKey', 'ResultValue', 'IsLowOxygenFlag', 'IsUnhealthyPHFlag', 'IsHighTurbidityFlag']
    
    fact_delta.to_sql('Fact_Water_Measurement', conn, if_exists='append', index=False)
    conn.commit()

# 3. VERIFY UPDATED ROW COUNTS
final_facts = pd.read_sql("SELECT COUNT(*) AS c FROM Fact_Water_Measurement", conn)['c'].iloc[0]

print("\n==================================================")
print("     INCREMENTAL BATCH LOAD AUDIT COMPLETE        ")
print("==================================================")
print(f"Pre-Load Fact Count:      {initial_facts:,}")
print(f"Incremental Facts Added: {len(delta_batch):,}")
print(f"Post-Load Total Facts:   {final_facts:,}")
print("==================================================")

conn.close()

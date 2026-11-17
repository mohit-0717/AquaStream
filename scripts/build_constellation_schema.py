import pandas as pd
import numpy as np
import sqlite3
import os

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"
DB_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\warehouse\water_quality_dw.db"

print("==================================================")
print("  PART B: FACT CONSTELLATION DIMENSIONAL MODEL    ")
print("==================================================\n")

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# 1. CREATE SECOND FACT TABLE (SQL DDL)
print("Creating Fact_Site_Monthly_Water_Quality Table...")

cursor.executescript("""
DROP TABLE IF EXISTS Fact_Site_Monthly_Water_Quality;

CREATE TABLE Fact_Site_Monthly_Water_Quality (
    ConstellationKey INTEGER PRIMARY KEY AUTOINCREMENT,
    Year INTEGER,
    Month INTEGER,
    LocationKey INTEGER,
    ParameterKey INTEGER,
    SampleCount INTEGER,
    AverageResult REAL,
    MinimumResult REAL,
    MaximumResult REAL,
    ExceedanceCount INTEGER,
    HighRiskCount INTEGER,
    FOREIGN KEY (LocationKey) REFERENCES Dim_Location(LocationKey),
    FOREIGN KEY (ParameterKey) REFERENCES Dim_Parameter(ParameterKey)
);
""")
conn.commit()

# 2. COMPUTE & INSERT MONTHLY SITE AGGREGATIONS
print("Streaming clean CSV to aggregate Monthly Site Facts...\n")

CHUNK_SIZE = 100_000
monthly_records = []

for chunk in pd.read_csv(CURATED_FILE, chunksize=CHUNK_SIZE, low_memory=False):
    chunk['ActivityStartDate'] = pd.to_datetime(chunk['ActivityStartDate'], errors='coerce')
    chunk = chunk.dropna(subset=['ActivityStartDate'])
    
    chunk['Year'] = chunk['ActivityStartDate'].dt.year
    chunk['Month'] = chunk['ActivityStartDate'].dt.month
    
    chunk['IsExceedance'] = np.where(
        ((chunk['CharacteristicName'] == 'pH') & ((chunk['ResultNumeric'] < 6.5) | (chunk['ResultNumeric'] > 8.5))) |
        ((chunk['CharacteristicName'] == 'Turbidity') & (chunk['ResultNumeric'] > 50.0)), 1, 0
    )
    chunk['IsHighRisk'] = np.where((chunk['CharacteristicName'] == 'Dissolved oxygen (DO)') & (chunk['ResultNumeric'] < 4.0), 1, 0)
    
    # Aggregate chunk by Site x Parameter x Year x Month
    grp = chunk.groupby(['Year', 'Month', 'MonitoringLocationIdentifier', 'CharacteristicName']).agg(
        SampleCount=('ResultNumeric', 'count'),
        AverageResult=('ResultNumeric', 'mean'),
        MinimumResult=('ResultNumeric', 'min'),
        MaximumResult=('ResultNumeric', 'max'),
        ExceedanceCount=('IsExceedance', 'sum'),
        HighRiskCount=('IsHighRisk', 'sum')
    ).reset_index()
    
    monthly_records.append(grp)

# Combine intermediate aggregates
print("Finalizing Monthly Constellation Aggregations...")
df_monthly = pd.concat(monthly_records, ignore_index=True)

final_agg = df_monthly.groupby(['Year', 'Month', 'MonitoringLocationIdentifier', 'CharacteristicName']).agg(
    SampleCount=('SampleCount', 'sum'),
    AverageResult=('AverageResult', 'mean'),
    MinimumResult=('MinimumResult', 'min'),
    MaximumResult=('MaximumResult', 'max'),
    ExceedanceCount=('ExceedanceCount', 'sum'),
    HighRiskCount=('HighRiskCount', 'sum')
).reset_index()

# Map Dimension Keys
loc_map = pd.read_sql("SELECT LocationKey, MonitoringLocationIdentifier FROM Dim_Location", conn).set_index('MonitoringLocationIdentifier')['LocationKey'].to_dict()
param_map = pd.read_sql("SELECT ParameterKey, CharacteristicName FROM Dim_Parameter", conn).set_index('CharacteristicName')['ParameterKey'].to_dict()

final_agg['LocationKey'] = final_agg['MonitoringLocationIdentifier'].map(loc_map)
final_agg['ParameterKey'] = final_agg['CharacteristicName'].map(param_map)
final_agg = final_agg.dropna(subset=['LocationKey', 'ParameterKey'])

final_agg['LocationKey'] = final_agg['LocationKey'].astype(int)
final_agg['ParameterKey'] = final_agg['ParameterKey'].astype(int)

# Select final columns for database insertion
insert_df = final_agg[['Year', 'Month', 'LocationKey', 'ParameterKey', 'SampleCount', 'AverageResult', 'MinimumResult', 'MaximumResult', 'ExceedanceCount', 'HighRiskCount']].copy()

insert_df.to_sql('Fact_Site_Monthly_Water_Quality', conn, if_exists='append', index=False)
conn.commit()

print("\n==================================================")
print(" CONSTELLATION ETL COMPLETED SUCCESSFULLY!        ")
print("==================================================")

# Verify Row Count
fact_constellation_cnt = pd.read_sql("SELECT COUNT(*) AS c FROM Fact_Site_Monthly_Water_Quality", conn)['c'].iloc[0]
print(f"Fact_Site_Monthly_Water_Quality Total Rows: {fact_constellation_cnt:,}")
print("==================================================")

conn.close()

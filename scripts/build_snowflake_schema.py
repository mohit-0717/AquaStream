import pandas as pd
import numpy as np
import sqlite3
import os

CURATED_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\curated\clean_water_quality.csv"
DB_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\warehouse\water_quality_dw.db"

print("==================================================")
print("  PART C: SNOWFLAKE SCHEMA DATA WAREHOUSE ETL    ")
print("==================================================\n")

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# 1. CREATE SNOWFLAKE TABLES (SQL DDL)
print("Creating Normalized Snowflake Schema Tables...")

cursor.executescript("""
DROP TABLE IF EXISTS Fact_Water_Measurement_Snowflake;
DROP TABLE IF EXISTS Dim_Location_Snowflake;
DROP TABLE IF EXISTS Dim_Organization;
DROP TABLE IF EXISTS Dim_Parameter_Snowflake;
DROP TABLE IF EXISTS Dim_ParameterGroup;
DROP TABLE IF EXISTS Dim_Date_Snowflake;

-- 1. Sub-Dimension: Dim_Organization
CREATE TABLE Dim_Organization (
    OrganizationKey INTEGER PRIMARY KEY AUTOINCREMENT,
    OrganizationIdentifier TEXT UNIQUE
);

-- 2. Sub-Dimension: Dim_ParameterGroup
CREATE TABLE Dim_ParameterGroup (
    GroupKey INTEGER PRIMARY KEY AUTOINCREMENT,
    ParameterGroupName TEXT UNIQUE
);

-- 3. Normalized Dimension: Dim_Location_Snowflake
CREATE TABLE Dim_Location_Snowflake (
    LocationKey INTEGER PRIMARY KEY AUTOINCREMENT,
    MonitoringLocationIdentifier TEXT UNIQUE,
    OrganizationKey INTEGER,
    Latitude REAL,
    Longitude REAL,
    FOREIGN KEY (OrganizationKey) REFERENCES Dim_Organization(OrganizationKey)
);

-- 4. Normalized Dimension: Dim_Parameter_Snowflake
CREATE TABLE Dim_Parameter_Snowflake (
    ParameterKey INTEGER PRIMARY KEY AUTOINCREMENT,
    CharacteristicName TEXT UNIQUE,
    GroupKey INTEGER,
    MeasureUnitCode TEXT,
    FOREIGN KEY (GroupKey) REFERENCES Dim_ParameterGroup(GroupKey)
);

-- 5. Dim_Date_Snowflake
CREATE TABLE Dim_Date_Snowflake (
    DateKey INTEGER PRIMARY KEY,
    FullDate TEXT UNIQUE,
    Year INTEGER,
    Quarter INTEGER,
    Month INTEGER,
    Season TEXT
);

-- 6. Fact Table
CREATE TABLE Fact_Water_Measurement_Snowflake (
    MeasurementKey INTEGER PRIMARY KEY AUTOINCREMENT,
    DateKey INTEGER,
    LocationKey INTEGER,
    ParameterKey INTEGER,
    ResultValue REAL,
    IsLowOxygenFlag INTEGER,
    IsUnhealthyPHFlag INTEGER,
    IsHighTurbidityFlag INTEGER,
    FOREIGN KEY (DateKey) REFERENCES Dim_Date_Snowflake(DateKey),
    FOREIGN KEY (LocationKey) REFERENCES Dim_Location_Snowflake(LocationKey),
    FOREIGN KEY (ParameterKey) REFERENCES Dim_Parameter_Snowflake(ParameterKey)
);
""")
conn.commit()

# Parameter Domain Group Mapping
PARAM_GROUP_MAP = {
    'Temperature, water': 'Physical',
    'Dissolved oxygen (DO)': 'Physical',
    'pH': 'Physical',
    'Turbidity': 'Physical',
    'Conductivity': 'Inorganics',
    'Nitrate': 'Nutrients'
}

# 2. POPULATE SNOWFLAKE DIMENSIONS &amp; FACT TABLE
print("Streaming clean CSV to populate Snowflake Schema...\n")

CHUNK_SIZE = 100_000
total_facts = 0

for chunk_idx, chunk in enumerate(pd.read_csv(CURATED_FILE, chunksize=CHUNK_SIZE, low_memory=False)):
    
    # --- A. DIM_ORGANIZATION ---
    unique_orgs = chunk[['OrganizationIdentifier']].drop_duplicates()
    for _, row in unique_orgs.iterrows():
        cursor.execute("INSERT OR IGNORE INTO Dim_Organization (OrganizationIdentifier) VALUES (?)", (row['OrganizationIdentifier'],))
        
    # --- B. DIM_PARAMETERGROUP &amp; DIM_PARAMETER_SNOWFLAKE ---
    unique_params = chunk[['CharacteristicName', 'ResultMeasure/MeasureUnitCode']].drop_duplicates()
    for _, row in unique_params.iterrows():
        grp_name = PARAM_GROUP_MAP.get(row['CharacteristicName'], 'General')
        cursor.execute("INSERT OR IGNORE INTO Dim_ParameterGroup (ParameterGroupName) VALUES (?)", (grp_name,))
        conn.commit()
        
        grp_id = pd.read_sql(f"SELECT GroupKey FROM Dim_ParameterGroup WHERE ParameterGroupName = '{grp_name}'", conn)['GroupKey'].iloc[0]
        cursor.execute("""
            INSERT OR IGNORE INTO Dim_Parameter_Snowflake (CharacteristicName, GroupKey, MeasureUnitCode)
            VALUES (?, ?, ?)
        """, (row['CharacteristicName'], int(grp_id), str(row['ResultMeasure/MeasureUnitCode'])))

    conn.commit()

    # --- C. DIM_LOCATION_SNOWFLAKE ---
    org_map = pd.read_sql("SELECT OrganizationKey, OrganizationIdentifier FROM Dim_Organization", conn).set_index('OrganizationIdentifier')['OrganizationKey'].to_dict()
    chunk['OrganizationKey'] = chunk['OrganizationIdentifier'].map(org_map)
    
    unique_locs = chunk[['MonitoringLocationIdentifier', 'OrganizationKey', 'Latitude', 'Longitude']].drop_duplicates()
    for _, row in unique_locs.iterrows():
        cursor.execute("""
            INSERT OR IGNORE INTO Dim_Location_Snowflake (MonitoringLocationIdentifier, OrganizationKey, Latitude, Longitude)
            VALUES (?, ?, ?, ?)
        """, (row['MonitoringLocationIdentifier'], int(row['OrganizationKey']), float(row['Latitude']), float(row['Longitude'])))

    # --- D. DIM_DATE_SNOWFLAKE ---
    chunk['ActivityStartDate'] = pd.to_datetime(chunk['ActivityStartDate'], errors='coerce')
    chunk = chunk.dropna(subset=['ActivityStartDate'])
    chunk['FullDateStr'] = chunk['ActivityStartDate'].dt.strftime('%Y-%m-%d')
    chunk['DateKey'] = chunk['ActivityStartDate'].dt.strftime('%Y%m%d').astype(int)
    
    unique_dates = chunk[['DateKey', 'FullDateStr', 'Year', 'Quarter', 'Month', 'Season']].drop_duplicates()
    for _, row in unique_dates.iterrows():
        cursor.execute("""
            INSERT OR IGNORE INTO Dim_Date_Snowflake (DateKey, FullDate, Year, Quarter, Month, Season)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (int(row['DateKey']), row['FullDateStr'], int(row['Year']), int(row['Quarter']), int(row['Month']), row['Season']))

    conn.commit()

    # --- E. FACT TABLE INSERTION ---
    loc_map = pd.read_sql("SELECT LocationKey, MonitoringLocationIdentifier FROM Dim_Location_Snowflake", conn).set_index('MonitoringLocationIdentifier')['LocationKey'].to_dict()
    param_map = pd.read_sql("SELECT ParameterKey, CharacteristicName FROM Dim_Parameter_Snowflake", conn).set_index('CharacteristicName')['ParameterKey'].to_dict()
    
    chunk['LocationKey'] = chunk['MonitoringLocationIdentifier'].map(loc_map)
    chunk['ParameterKey'] = chunk['CharacteristicName'].map(param_map)
    
    chunk['IsLowOxygenFlag'] = np.where((chunk['CharacteristicName'] == 'Dissolved oxygen (DO)') & (chunk['ResultNumeric'] < 4.0), 1, 0)
    chunk['IsUnhealthyPHFlag'] = np.where((chunk['CharacteristicName'] == 'pH') & ((chunk['ResultNumeric'] < 6.5) | (chunk['ResultNumeric'] > 8.5)), 1, 0)
    chunk['IsHighTurbidityFlag'] = np.where((chunk['CharacteristicName'] == 'Turbidity') & (chunk['ResultNumeric'] > 50.0), 1, 0)
    
    fact_chunk = chunk[['DateKey', 'LocationKey', 'ParameterKey', 'ResultNumeric', 'IsLowOxygenFlag', 'IsUnhealthyPHFlag', 'IsHighTurbidityFlag']].copy()
    fact_chunk.columns = ['DateKey', 'LocationKey', 'ParameterKey', 'ResultValue', 'IsLowOxygenFlag', 'IsUnhealthyPHFlag', 'IsHighTurbidityFlag']
    
    fact_chunk.to_sql('Fact_Water_Measurement_Snowflake', conn, if_exists='append', index=False)
    total_facts += len(fact_chunk)
    print(f"   Processed batch {chunk_idx + 1} ({total_facts:,} facts inserted into Snowflake Fact table)")

print("\n==================================================")
print("     SNOWFLAKE SCHEMA ETL COMPLETED SUCCESSFULLY!  ")
print("==================================================")

# Verify Row Counts
print("\n--- SNOWFLAKE TABLE ROW COUNTS ---")
print(f"Dim_Organization:            {pd.read_sql('SELECT COUNT(*) AS c FROM Dim_Organization', conn)['c'].iloc[0]:,}")
print(f"Dim_ParameterGroup:          {pd.read_sql('SELECT COUNT(*) AS c FROM Dim_ParameterGroup', conn)['c'].iloc[0]:,}")
print(f"Dim_Location_Snowflake:      {pd.read_sql('SELECT COUNT(*) AS c FROM Dim_Location_Snowflake', conn)['c'].iloc[0]:,}")
print(f"Dim_Parameter_Snowflake:     {pd.read_sql('SELECT COUNT(*) AS c FROM Dim_Parameter_Snowflake', conn)['c'].iloc[0]:,}")
print(f"Fact_Water_Measurement:      {pd.read_sql('SELECT COUNT(*) AS c FROM Fact_Water_Measurement_Snowflake', conn)['c'].iloc[0]:,}")
print("==================================================")

conn.close()

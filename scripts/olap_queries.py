import sqlite3
import pandas as pd

DB_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\warehouse\water_quality_dw.db"
conn = sqlite3.connect(DB_FILE)

print("==================================================")
print("    PART F: OLAP & SEMANTIC CUBE OPERATIONS       ")
print("==================================================\n")

# 1. ROLL-UP OPERATION (Day -> Month -> Year Granularity)
print("--- 1. OLAP ROLL-UP: Monthly to Yearly DO Averages ---")
query_rollup = """
SELECT 
    d.Year,
    d.Month,
    COUNT(f.MeasurementKey) AS Sample_Count,
    ROUND(AVG(f.ResultValue), 2) AS Mean_DO_mgL
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
JOIN Dim_Parameter p ON f.ParameterKey = p.ParameterKey
WHERE p.CharacteristicName = 'Dissolved oxygen (DO)'
GROUP BY d.Year, d.Month
ORDER BY d.Year, d.Month;
"""
print(pd.read_sql(query_rollup, conn).head(8).to_string(index=False))
print("\n")

# 2. DRILL-DOWN OPERATION (Organization -> Individual Stations)
print("--- 2. OLAP DRILL-DOWN: Top Stations for Agency 'WIDNR_WQX' ---")
query_drilldown = """
SELECT 
    l.OrganizationIdentifier,
    l.MonitoringLocationIdentifier,
    COUNT(f.MeasurementKey) AS Total_Samples,
    ROUND(AVG(f.ResultValue), 2) AS Mean_Result
FROM Fact_Water_Measurement f
JOIN Dim_Location l ON f.LocationKey = l.LocationKey
WHERE l.OrganizationIdentifier = 'WIDNR_WQX'
GROUP BY l.OrganizationIdentifier, l.MonitoringLocationIdentifier
ORDER BY Total_Samples DESC
LIMIT 5;
"""
print(pd.read_sql(query_drilldown, conn).to_string(index=False))
print("\n")

# 3. SLICE OPERATION (Filter on Single Dimension Member: Season = 'Summer')
print("--- 3. OLAP SLICE: Summer Season Parameter Averages ---")
query_slice = """
SELECT 
    p.CharacteristicName,
    COUNT(f.MeasurementKey) AS Summer_Sample_Count,
    ROUND(AVG(f.ResultValue), 2) AS Summer_Average
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
JOIN Dim_Parameter p ON f.ParameterKey = p.ParameterKey
WHERE d.Season = 'Summer'
GROUP BY p.CharacteristicName;
"""
print(pd.read_sql(query_slice, conn).to_string(index=False))
print("\n")

# 4. DICE OPERATION (Sub-cube: Summer + Dissolved Oxygen + High-Volume Stations)
print("--- 4. OLAP DICE: Sub-Cube (Summer + Dissolved Oxygen) ---")
query_dice = """
SELECT 
    d.Year,
    d.Season,
    p.CharacteristicName,
    COUNT(f.MeasurementKey) AS Total_Observations,
    SUM(f.IsLowOxygenFlag) AS Hypoxia_Risk_Events
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
JOIN Dim_Parameter p ON f.ParameterKey = p.ParameterKey
WHERE d.Season = 'Summer' 
  AND p.CharacteristicName = 'Dissolved oxygen (DO)'
GROUP BY d.Year, d.Season, p.CharacteristicName;
"""
print(pd.read_sql(query_dice, conn).to_string(index=False))
print("\n")

# 5. PIVOT OPERATION (Parameter vs. Season Cross-Tabulation)
print("--- 5. OLAP PIVOT: Parameter Medians Across Seasons ---")
query_pivot_base = """
SELECT 
    p.CharacteristicName,
    d.Season,
    f.ResultValue
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
JOIN Dim_Parameter p ON f.ParameterKey = p.ParameterKey;
"""
df_pivot_raw = pd.read_sql(query_pivot_base, conn)
pivot_table = df_pivot_raw.pivot_table(index='CharacteristicName', columns='Season', values='ResultValue', aggfunc='median')
print(pivot_table.round(2))
print("\n")

# 6. ADVANCED GROUPING SETS / CUBE QUERY (Multidimensional Aggregation)
print("--- 6. OLAP MULTIDIMENSIONAL AGGREGATIONS (SQL GROUP BY WITH ROLLUP) ---")
query_groupings = """
SELECT 
    COALESCE(d.Year, 'ALL YEARS') AS Year,
    COALESCE(d.Season, 'ALL SEASONS') AS Season,
    COUNT(f.MeasurementKey) AS Total_Facts,
    SUM(f.IsLowOxygenFlag) AS Total_Hypoxia_Flags
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
GROUP BY d.Year, d.Season WITH ROLLUP;
"""
try:
    print(pd.read_sql(query_groupings, conn).to_string(index=False))
except Exception as e:
    # Fallback for SQLite versions that simulate ROLLUP via UNION ALL
    query_union_rollup = """
    SELECT CAST(d.Year AS TEXT) AS Year, d.Season, COUNT(f.MeasurementKey) AS Total_Facts, SUM(f.IsLowOxygenFlag) AS Hypoxia_Flags
    FROM Fact_Water_Measurement f JOIN Dim_Date d ON f.DateKey = d.DateKey
    GROUP BY d.Year, d.Season
    UNION ALL
    SELECT CAST(d.Year AS TEXT) AS Year, 'YEAR TOTAL' AS Season, COUNT(f.MeasurementKey), SUM(f.IsLowOxygenFlag)
    FROM Fact_Water_Measurement f JOIN Dim_Date d ON f.DateKey = d.DateKey
    GROUP BY d.Year
    UNION ALL
    SELECT 'GRAND TOTAL' AS Year, 'ALL SEASONS' AS Season, COUNT(f.MeasurementKey), SUM(f.IsLowOxygenFlag)
    FROM Fact_Water_Measurement f;
    """
    print(pd.read_sql(query_union_rollup, conn).to_string(index=False))

print("\n==================================================")
print("        OLAP CUBE OPERATIONS COMPLETE!            ")
print("==================================================")

conn.close()

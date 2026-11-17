import sqlite3
import pandas as pd

DB_FILE = r"C:\Users\mohit\Documents\EDA-Project\data\warehouse\water_quality_dw.db"
conn = sqlite3.connect(DB_FILE)

print("==================================================")
print("     VERIFYING STAR SCHEMA DATA WAREHOUSE         ")
print("==================================================\n")

# Query 1: Table Row Counts
print("--- 1. Warehouse Row Counts ---")
query_counts = """
SELECT 
    (SELECT COUNT(*) FROM Dim_Date) AS Total_Dates,
    (SELECT COUNT(*) FROM Dim_Location) AS Total_Locations,
    (SELECT COUNT(*) FROM Dim_Parameter) AS Total_Parameters,
    (SELECT COUNT(*) FROM Fact_Water_Measurement) AS Total_Facts;
"""
print(pd.read_sql(query_counts, conn).to_string(index=False))
print("\n")

# Query 2: Star Schema Join Query (Facts + Dimensions)
print("--- 2. Sample Star Schema Analytical Join Query ---")
query_join = """
SELECT 
    d.Year,
    d.Season,
    p.CharacteristicName,
    COUNT(f.MeasurementKey) AS Total_Observations,
    ROUND(AVG(f.ResultValue), 2) AS Mean_Value,
    SUM(f.IsLowOxygenFlag) AS Hypoxia_Risk_Count
FROM Fact_Water_Measurement f
JOIN Dim_Date d ON f.DateKey = d.DateKey
JOIN Dim_Parameter p ON f.ParameterKey = p.ParameterKey
WHERE p.CharacteristicName = 'Dissolved oxygen (DO)'
GROUP BY d.Year, d.Season
ORDER BY d.Year DESC, d.Season;
"""
print(pd.read_sql(query_join, conn).to_string(index=False))

conn.close()

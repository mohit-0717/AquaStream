from pathlib import Path

import pandas as pd


PROJECT_DIR = Path(__file__).resolve().parents[1]
RAW_PATH = PROJECT_DIR / "data" / "raw" / "resultphyschem.csv"
CURATED_DIR = PROJECT_DIR / "data" / "curated"
CURATED_FILE = CURATED_DIR / "clean_water_quality.csv"
CHUNK_SIZE = 100_000

USE_COLUMNS = [
    "MonitoringLocationIdentifier",
    "ActivityStartDate",
    "ActivityStartTime/Time",
    "CharacteristicName",
    "ResultMeasureValue",
    "ResultMeasure/MeasureUnitCode",
    "OrganizationIdentifier",
    "ActivityLocation/LatitudeMeasure",
    "ActivityLocation/LongitudeMeasure",
]
OUTPUT_COLUMNS = [
    column
    for column in USE_COLUMNS
    if column
    not in (
        "ActivityLocation/LatitudeMeasure",
        "ActivityLocation/LongitudeMeasure",
    )
] + [
    "ResultNumeric",
    "Year",
    "Month",
    "Quarter",
    "Season",
    "Latitude",
    "Longitude",
]

VALID_BOUNDS = {
    "pH": (0.0, 14.0),
    "Dissolved oxygen (DO)": (0.0, 20.0),
    "Temperature, water": (-10.0, 50.0),
    "Turbidity": (0.0, 10_000.0),
    "Conductivity": (0.0, 100_000.0),
    "Nitrate": (0.0, 500.0),
}


def get_season(month: int) -> str:
    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Spring"
    if month in (6, 7, 8):
        return "Summer"
    return "Autumn"


def main() -> None:
    if not RAW_PATH.is_file():
        raise FileNotFoundError(f"Raw dataset not found: {RAW_PATH}")

    CURATED_DIR.mkdir(parents=True, exist_ok=True)

    available_columns = set(pd.read_csv(RAW_PATH, nrows=0).columns)
    missing_columns = sorted(set(USE_COLUMNS) - available_columns)
    if missing_columns:
        raise ValueError(
            "Raw dataset is missing required columns: "
            + ", ".join(missing_columns)
        )

    total_raw_rows = 0
    total_curated_rows = 0
    wrote_output = False

    print("STEP 3: DATA CLEANING & FEATURE CURATION")
    print(f"Reading: {RAW_PATH}")

    for chunk_number, chunk in enumerate(
        pd.read_csv(
            RAW_PATH,
            usecols=USE_COLUMNS,
            chunksize=CHUNK_SIZE,
            low_memory=False,
        ),
        start=1,
    ):
        total_raw_rows += len(chunk)

        cleaned = chunk.dropna(
            subset=["ResultMeasureValue", "CharacteristicName"]
        ).copy()
        cleaned["ResultNumeric"] = pd.to_numeric(
            cleaned["ResultMeasureValue"], errors="coerce"
        )
        cleaned = cleaned.dropna(subset=["ResultNumeric"])

        valid_mask = pd.Series(False, index=cleaned.index)
        for characteristic, (minimum, maximum) in VALID_BOUNDS.items():
            matches_characteristic = (
                cleaned["CharacteristicName"] == characteristic
            )
            within_bounds = cleaned["ResultNumeric"].between(
                minimum, maximum, inclusive="both"
            )
            valid_mask |= matches_characteristic & within_bounds

        not_bounded_parameter = ~cleaned["CharacteristicName"].isin(
            VALID_BOUNDS
        )
        cleaned = cleaned[valid_mask | not_bounded_parameter].copy()

        cleaned["ActivityStartDate"] = pd.to_datetime(
            cleaned["ActivityStartDate"], errors="coerce"
        )
        cleaned = cleaned.dropna(subset=["ActivityStartDate"])
        cleaned["Year"] = cleaned["ActivityStartDate"].dt.year
        cleaned["Month"] = cleaned["ActivityStartDate"].dt.month
        cleaned["Quarter"] = cleaned["ActivityStartDate"].dt.quarter
        cleaned["Season"] = cleaned["Month"].map(get_season)

        cleaned["Latitude"] = pd.to_numeric(
            cleaned.pop("ActivityLocation/LatitudeMeasure"), errors="coerce"
        )
        cleaned["Longitude"] = pd.to_numeric(
            cleaned.pop("ActivityLocation/LongitudeMeasure"), errors="coerce"
        )

        total_curated_rows += len(cleaned)
        cleaned.to_csv(
            CURATED_FILE,
            index=False,
            mode="w" if not wrote_output else "a",
            header=not wrote_output,
        )
        wrote_output = True
        print(f"Processed chunk {chunk_number:,} ({total_raw_rows:,} rows)")

    if not wrote_output:
        pd.DataFrame(columns=OUTPUT_COLUMNS).to_csv(CURATED_FILE, index=False)

    filtered_rows = total_raw_rows - total_curated_rows
    filtered_percent = (
        filtered_rows / total_raw_rows * 100 if total_raw_rows else 0.0
    )
    print("\nCURATION SUMMARY")
    print(f"Total raw rows processed: {total_raw_rows:,}")
    print(f"Total curated rows preserved: {total_curated_rows:,}")
    print(f"Rows filtered: {filtered_rows:,} ({filtered_percent:.2f}%)")
    print(f"Curated file saved to: {CURATED_FILE}")


if __name__ == "__main__":
    main()

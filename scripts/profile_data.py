from pathlib import Path

import pandas as pd


FILE_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "resultphyschem.csv"
)
CHUNK_SIZE = 100_000

TARGET_COLUMNS = [
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


def main() -> None:
    if not FILE_PATH.is_file():
        raise FileNotFoundError(f"Dataset not found: {FILE_PATH}")

    print("MEMORY-EFFICIENT DATA PROFILING & AUDIT")
    print(f"Dataset: {FILE_PATH}")
    print("Reading CSV header...")

    columns = pd.read_csv(FILE_PATH, nrows=0).columns.tolist()
    use_columns = [column for column in TARGET_COLUMNS if column in columns]
    if not use_columns:
        raise ValueError("None of the expected profiling columns exist in the CSV.")

    print(f"Columns in file: {len(columns)}")
    print(f"Selected columns: {use_columns}")

    total_rows = 0
    missing_counts = pd.Series(0, index=use_columns, dtype="int64")
    characteristic_counts = pd.Series(dtype="int64")
    numeric_stats: dict[str, tuple[int, float, float, float, float]] = {}

    print(f"Processing CSV in chunks of {CHUNK_SIZE:,} rows...")
    for chunk_number, chunk in enumerate(
        pd.read_csv(
            FILE_PATH,
            usecols=use_columns,
            chunksize=CHUNK_SIZE,
            low_memory=False,
        ),
        start=1,
    ):
        total_rows += len(chunk)
        missing_counts = missing_counts.add(chunk.isna().sum(), fill_value=0)

        if "CharacteristicName" in chunk.columns:
            counts = chunk["CharacteristicName"].value_counts()
            characteristic_counts = characteristic_counts.add(
                counts, fill_value=0
            )

        if {"CharacteristicName", "ResultMeasureValue"}.issubset(chunk.columns):
            numeric_values = pd.to_numeric(
                chunk["ResultMeasureValue"], errors="coerce"
            )
            numeric_data = pd.DataFrame(
                {
                    "CharacteristicName": chunk["CharacteristicName"],
                    "ResultNumeric": numeric_values,
                }
            ).dropna(subset=["CharacteristicName", "ResultNumeric"])

            for name, group in numeric_data.groupby(
                "CharacteristicName", sort=False
            )["ResultNumeric"]:
                count = int(group.count())
                mean = float(group.mean())
                variance = float(group.var(ddof=1)) if count > 1 else 0.0
                chunk_m2 = variance * (count - 1)
                minimum = float(group.min())
                maximum = float(group.max())

                if name not in numeric_stats:
                    numeric_stats[name] = (
                        count,
                        mean,
                        chunk_m2,
                        minimum,
                        maximum,
                    )
                    continue

                old_count, old_mean, old_m2, old_min, old_max = numeric_stats[name]
                combined_count = old_count + count
                delta = mean - old_mean
                combined_mean = old_mean + delta * count / combined_count
                combined_m2 = (
                    old_m2
                    + chunk_m2
                    + delta * delta * old_count * count / combined_count
                )
                numeric_stats[name] = (
                    combined_count,
                    combined_mean,
                    combined_m2,
                    min(old_min, minimum),
                    max(old_max, maximum),
                )

        print(f"Processed chunk {chunk_number:,} ({total_rows:,} rows)")

    print("\nDATA PROFILING SUMMARY")
    print(f"Total records: {total_rows:,}")

    print("\n1. MISSING VALUE AUDIT")
    if total_rows:
        missing_summary = pd.DataFrame(
            {
                "Missing Count": missing_counts.astype("int64"),
                "Missing %": (missing_counts / total_rows * 100).round(2),
            }
        )
        print(missing_summary)
    else:
        print("The CSV contains no data rows.")

    print("\n2. TOP 10 MONITORED PARAMETERS")
    top_parameters = characteristic_counts.sort_values(
        ascending=False
    ).head(10)
    print(top_parameters.astype("int64"))

    print("\n3. NUMERICAL STATISTICS FOR TOP 5 PARAMETERS")
    top_names = top_parameters.head(5).index
    rows = []
    for name in top_names:
        if name not in numeric_stats:
            continue
        count, mean, m2, minimum, maximum = numeric_stats[name]
        standard_deviation = (m2 / (count - 1)) ** 0.5 if count > 1 else float("nan")
        rows.append(
            {
                "CharacteristicName": name,
                "Count": count,
                "Min": minimum,
                "Mean": mean,
                "Max": maximum,
                "Std": standard_deviation,
            }
        )

    if rows:
        print(pd.DataFrame(rows).round(2).to_string(index=False))
    else:
        print("No numeric measurement values found for the top parameters.")

    print("\nProfiling completed.")


if __name__ == "__main__":
    main()

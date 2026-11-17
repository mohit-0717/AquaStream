from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import pandas as pd


CURATED_FILE = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "curated"
    / "clean_water_quality.csv"
)
CHUNK_SIZE = 100_000
REQUIRED_COLUMNS = {"CharacteristicName", "ResultNumeric"}


def main() -> None:
    if not CURATED_FILE.is_file():
        raise FileNotFoundError(f"Curated dataset not found: {CURATED_FILE}")

    columns = set(pd.read_csv(CURATED_FILE, nrows=0).columns)
    missing_columns = REQUIRED_COLUMNS - columns
    if missing_columns:
        raise ValueError(
            "Curated dataset is missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    print("POST-CURATION CLEAN SUMMARY STATISTICS")
    print(f"Dataset: {CURATED_FILE}")
    print(f"Processing in chunks of {CHUNK_SIZE:,} rows...")

    value_files: dict[str, Path] = {}
    total_rows = 0
    valid_rows = 0

    # Spill values to disk by parameter so exact quantiles do not require
    # keeping the entire dataset, including repeated parameter names, in RAM.
    with TemporaryDirectory(prefix="clean_stats_") as temp_dir:
        temp_path = Path(temp_dir)
        for chunk_number, chunk in enumerate(
            pd.read_csv(
                CURATED_FILE,
                usecols=["CharacteristicName", "ResultNumeric"],
                chunksize=CHUNK_SIZE,
                low_memory=False,
            ),
            start=1,
        ):
            total_rows += len(chunk)
            chunk["ResultNumeric"] = pd.to_numeric(
                chunk["ResultNumeric"], errors="coerce"
            )
            chunk = chunk.dropna(subset=["CharacteristicName", "ResultNumeric"])
            valid_rows += len(chunk)

            for name, group in chunk.groupby(
                "CharacteristicName", sort=False
            )["ResultNumeric"]:
                if name not in value_files:
                    value_files[name] = temp_path / f"parameter_{len(value_files)}.bin"
                with value_files[name].open("ab") as value_file:
                    group.to_numpy(dtype=np.float64).tofile(value_file)

            print(f"Processed chunk {chunk_number:,} ({total_rows:,} rows)")

        print(f"\nRows read: {total_rows:,}")
        print(f"Rows with parameter and numeric value: {valid_rows:,}")

        if not value_files:
            print("No numeric measurement values found; no statistics to report.")
            return

        rows = []
        for name, value_file in value_files.items():
            values = np.fromfile(value_file, dtype=np.float64)
            quartiles = np.quantile(values, [0.25, 0.5, 0.75])
            series = pd.Series(values)
            q25, median, q75 = quartiles
            rows.append(
                {
                    "CharacteristicName": name,
                    "Count": values.size,
                    "Min": values.min(),
                    "Q25": q25,
                    "Median": median,
                    "Mean": values.mean(),
                    "Q75": q75,
                    "Max": values.max(),
                    "Std": values.std(ddof=1) if values.size > 1 else np.nan,
                    "IQR": q75 - q25,
                    "Skewness": series.skew(),
                }
            )

        stats = pd.DataFrame(rows).sort_values(
            "CharacteristicName", kind="stable"
        )
        pd.set_option("display.max_columns", None)
        pd.set_option("display.width", 1_000)
        print("\nExact summary statistics by parameter:")
        print(stats.round(2).to_string(index=False))


if __name__ == "__main__":
    main()

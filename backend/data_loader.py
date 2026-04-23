import csv
import os
from typing import Any, Dict, Union
from pathlib import Path
from functools import lru_cache
from collections import defaultdict
import warnings

RiskInfo = Dict[str, Any]

def _normalise_ingredient_name(name: str) -> str:
    return (name or "").strip().lower()

def _csv_path() -> Path:
    #backend/data_loader.py -> repo_root/data/qt_risk_drugs_crediblemeds.csv
    repo_root = Path(__file__).resolve().parents[1]
    return repo_root / "data" / "qt_risk_drugs_crediblemeds.csv"

@lru_cache(maxsize=1)
def _load_db() -> Dict[str, RiskInfo]:
    path = _csv_path()
    if not path.exists():
        raise FileNotFoundError(f"QT risk CSV not found at: {path}")

    with path.open("r", encoding="utf-8-sig", newline="") as f:
        #file appears to have a blank first row; sniff until we find the header
        #we'll read all rows and pick the first row that contains 'ingredient_name'
        rows = list(csv.reader(f))
    
    header_idx = None
    for i, row in enumerate(rows):
        if any((cell or "").strip() == "ingredient_name" for cell in row):
            header_idx = i
            break

    if header_idx is None:
        raise ValueError("Could not find a header row containing 'ingredient_name'.")
    
    header = [h.strip() for h in rows [header_idx]]
    data_rows = rows[header_idx + 1 :]

    #Build dict; if duplicates exist, keep the first and warn
    db: Dict[str, RiskInfo] = {}
    dupes = defaultdict(int)

    for row in data_rows:
        if not row or all((c or "").strip() == "" for c in row):
            continue
        #pad short rows to header length.
        if len(row) < len(header):
            row = row + [""] * (len(header) - len(row))

        record: RiskInfo = dict(zip(header, row))
        key = _normalise_ingredient_name(record.get("ingredient_name", ""))
        if not key:
            continue
        if key in db:
            dupes[key] += 1
            continue
        db[key] = record

    if dupes:
        warnings.warn(
            "Duplicate ingredient_name entries found; keeping first occurrence. "
            f"Duplicates: {len(dupes)}"
        )
 
    return db
 
 
def get_risk(ingredient_name: str) -> Union[RiskInfo, str]:
    """
    Lookup risk information by ingredient name (case-insensitive).
 
    Returns:
      - dict of CSV row data if found
      - "not_found" if missing
    """
    key = _normalise_ingredient_name(ingredient_name)
    if not key:
        return "not_found"
    return _load_db().get(key, "not_found")

if __name__ == "__main__":
    print(get_risk("Amantadine"))
    print(get_risk("Amiodarone"))
    print(get_risk("Amisulpride"))

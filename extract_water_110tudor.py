#!/usr/bin/env python3
"""Extract water usage data from BWSC statements for 110 Tudor St."""

import pymupdf
import os
import re
import json
from datetime import datetime

BASE = "/Users/albert/albert_git_repos/albert-business/property_110_tudor_st/service_providers/boston_water_sewer"


def extract_text(filepath):
    doc = pymupdf.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text(sort=True)
    doc.close()
    return text


def parse_statement(text, filename):
    result = {"filename": filename, "cf": None, "water": None, "sewer": None,
              "period_start": None, "period_end": None}

    text_joined = re.sub(r'\n', ' ', text)

    # --- Extract billing period ---
    # New format (Oct 2019+): "Previous Bill Date MM/DD/YYYY" and "Current Bill Date MM/DD/YYYY"
    prev_date = re.search(r'Previous\s+Bill\s+Date\s+(\d{2}/\d{2}/\d{4})', text_joined)
    curr_date = re.search(r'Current\s+Bill\s+Date\s+(\d{2}/\d{2}/\d{4})', text_joined)
    if prev_date and curr_date:
        try:
            result["period_start"] = datetime.strptime(prev_date.group(1), "%m/%d/%Y").strftime("%Y-%m-%d")
            result["period_end"] = datetime.strptime(curr_date.group(1), "%m/%d/%Y").strftime("%Y-%m-%d")
        except:
            pass

    # Old format (2009-Sep 2019): "NN DAYS MM/DD/YY ... MM/DD/YY"
    if not result["period_end"]:
        # Look for billing period dates in the header area
        period_match = re.search(r'(\d{2}/\d{2}/\d{2,4})\s+.*?(\d{2}/\d{2}/\d{2,4})\s+.*?(\d+)\s+DAYS', text_joined)
        if not period_match:
            period_match = re.search(r'(\d+)\s+DAYS\s+(\d{2}/\d{2}/\d{2,4})\s+.*?(\d{2}/\d{2}/\d{2,4})', text_joined)
        if period_match:
            groups = period_match.groups()
            dates = []
            for g in groups:
                if '/' in g:
                    for fmt in ["%m/%d/%Y", "%m/%d/%y"]:
                        try:
                            dates.append(datetime.strptime(g, fmt))
                            break
                        except:
                            continue
            if len(dates) >= 2:
                dates.sort()
                result["period_start"] = dates[0].strftime("%Y-%m-%d")
                result["period_end"] = dates[1].strftime("%Y-%m-%d")

    # --- Extract consumption (cubic feet) ---
    # New format: "Current Service Period (NN Days) NNN CF"
    cf_match = re.search(r'Current\s+Service\s+Period\s*\(\d+\s*Days?\)\s+(\d[\d,]*)\s*CF', text_joined)
    if cf_match:
        result["cf"] = int(cf_match.group(1).replace(",", ""))

    # Old format: "cubic feet NNN" or "cubic feel NNN" (OCR error) or "cubicfeet NNN"
    if result["cf"] is None:
        cf_match2 = re.search(r'cubic\s*fee[tl]\s+(\d[\d,]*)', text_joined, re.IGNORECASE)
        if cf_match2:
            result["cf"] = int(cf_match2.group(1).replace(",", ""))

    # Fallback: derive from gallons (gallons / 7.481 = CF)
    if result["cf"] is None:
        gal_match = re.search(r'gallons\s+([\d,]+\.\d+)', text_joined, re.IGNORECASE)
        if gal_match:
            gallons = float(gal_match.group(1).replace(",", ""))
            result["cf"] = round(gallons / 7.481)

    # Fallback: meter read subtraction
    if result["cf"] is None:
        reads = re.findall(r'(?:^|\s)(\d{5})(?:\s|$)', text_joined)
        if len(reads) >= 2:
            try:
                r1, r2 = int(reads[0]), int(reads[1])
                diff = abs(r1 - r2)
                if 0 < diff < 5000:
                    result["cf"] = diff
            except:
                pass

    # --- Extract water charge ---
    # Old format: "WATER XX.XX" (uppercase, may have spaces in amount like "27. 59")
    water_match = re.search(r'WATER\s+\$?\s*(\d[\d,]*\s*\.\s*\d{2})', text_joined)
    if water_match:
        result["water"] = float(water_match.group(1).replace(",", "").replace(" ", ""))

    if result["water"] is None:
        # Reversed: "XX.XX ... WATER" (amount before label due to garbled layout)
        water_rev = re.search(r'(\d[\d,]*\.\d{2})\s+[^A-Z]*WATER', text_joined)
        if water_rev:
            val = float(water_rev.group(1).replace(",", ""))
            if val < 200:  # sanity check - water charge should be reasonable
                result["water"] = val

    if result["water"] is None:
        # New format: "Water $XX.XX" or "Water  _ $XX.XX" (with artifacts)
        water_match2 = re.search(r'Water\s+[^$\d]*\$\s*([\d,]+\.\d{2})', text_joined)
        if water_match2:
            result["water"] = float(water_match2.group(1).replace(",", ""))

    # --- Extract sewer charge ---
    # Old format: "SEWER XX.XX" (may have spaces in amount like "13 .64")
    sewer_match = re.search(r'SEWER\s+\$?\s*(\d[\d,]*\s*\.\s*\d{2})', text_joined)
    if sewer_match:
        result["sewer"] = float(sewer_match.group(1).replace(",", "").replace(" ", ""))

    if result["sewer"] is None:
        # Reversed: "XX.XX ... SEWER" (amount before label due to garbled layout)
        sewer_rev = re.search(r'(\d[\d,]*\.\d{2})\s+[^A-Z]*SEWER', text_joined)
        if sewer_rev:
            val = float(sewer_rev.group(1).replace(",", ""))
            if val < 200:
                result["sewer"] = val

    if result["sewer"] is None:
        # New format: "Sewer $XX.XX" (with possible artifacts before $)
        sewer_match2 = re.search(r'Sewer\s+[^$\d]*\$\s*([\d,]+\.\d{2})', text_joined)
        if sewer_match2:
            result["sewer"] = float(sewer_match2.group(1).replace(",", ""))

    # --- Fallback: derive missing water or sewer from total ---
    if result["water"] is None or result["sewer"] is None:
        # Match TOTAL CURRENT CHARGES or TOTAL SERVICE CHARGES
        # The amount may be far from the label with dots/chars in between, and may have spaces in amount
        total_match = re.search(r'TOTAL\s+(?:CURRENT\s+CHARGES|SERVICE\s+CHARGES).*?\$\s*([\d,]+\s*\.\s*\d{2})', text_joined)
        if not total_match:
            # Some bills only have "TOTAL AMOUNTDUE" or "TOTAL AMOUNT DUE"
            total_match = re.search(r'TOTAL\s+AMOUNT\s*DUE.*?\$\s*([\d,]+\s*\.\s*\d{2})', text_joined)
        if total_match:
            total = float(total_match.group(1).replace(",", "").replace(" ", ""))
            if result["water"] is not None and result["sewer"] is None:
                derived = round(total - result["water"], 2)
                if derived > 0:
                    result["sewer"] = derived
            elif result["sewer"] is not None and result["water"] is None:
                derived = round(total - result["sewer"], 2)
                if derived > 0:
                    result["water"] = derived

    return result


def main():
    files = sorted([f for f in os.listdir(BASE) if "Statement" in f and f.endswith(".pdf")])

    results = []
    errors = []

    for f in files:
        filepath = os.path.join(BASE, f)
        try:
            text = extract_text(filepath)

            if text is None:
                errors.append(f"  {f}: could not read")
                continue

            data = parse_statement(text, f)

            date_match = re.match(r'(\d{4}-\d{2}-\d{2})', f)
            if date_match:
                data["statement_date"] = date_match.group(1)

            if data["cf"] is None:
                errors.append(f"  {f}: no consumption (CF) found")
            if data["water"] is None:
                errors.append(f"  {f}: no water charge found")
            if data["sewer"] is None:
                errors.append(f"  {f}: no sewer charge found")

            results.append(data)
        except Exception as e:
            errors.append(f"  {f}: ERROR {e}")

    if errors:
        print("WARNINGS:")
        for e in errors:
            print(e)
        print()

    print(f"Total statements processed: {len(results)}")
    print(f"With CF data: {sum(1 for r in results if r['cf'] is not None)}")
    print(f"With water data: {sum(1 for r in results if r['water'] is not None)}")
    print(f"With sewer data: {sum(1 for r in results if r['sewer'] is not None)}")

    with open("/Users/albert/albert_git_repos/water_data_110tudor.json", "w") as fp:
        json.dump(results, fp, indent=2)
    print("\nData written to water_data_110tudor.json")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Extract electricity usage data from Eversource statements for 69 Hitching Post Ln."""

import pymupdf
import os
import re
import json
from datetime import datetime

BASE = "/Users/albert/albert_git_repos/albert-business/property_69_hitching_post_lane/service_providers/eversource_electric"


def extract_text(filepath):
    """Extract text from PDF with sort=True for proper column alignment."""
    doc = pymupdf.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text(sort=True)
    doc.close()
    return text


def parse_statement(text, filename):
    """Parse kWh, supply $, and delivery $ from statement text."""
    result = {"filename": filename, "kwh": None, "supply": None, "delivery": None,
              "period_start": None, "period_end": None}

    # Extract billing period: "Service from MM/DD/YY - MM/DD/YY"
    period_match = re.search(r'Service from (\d{2}/\d{2}/\d{2})\s*-\s*(\d{2}/\d{2}/\d{2})', text)
    if period_match:
        try:
            result["period_start"] = datetime.strptime(period_match.group(1), "%m/%d/%y").strftime("%Y-%m-%d")
            result["period_end"] = datetime.strptime(period_match.group(2), "%m/%d/%y").strftime("%Y-%m-%d")
        except:
            pass

    text_joined = re.sub(r'\n', ' ', text)

    # Extract kWh
    # NH format: "Energy Chrg - Rate R  NNN.NNkWh X $X.XXXXX"
    kwh_match = re.search(r'Energy\s+Chrg.*?(\d[\d,.]+)\s*kWh\s*X', text_joined, re.IGNORECASE)
    if kwh_match:
        result["kwh"] = int(float(kwh_match.group(1).replace(",", "")))

    if not result["kwh"]:
        # NH format: "Generation Srvc Chrg  NNN.NNkWh X $X.XXXXX" (may have multiple, sum them)
        gen_matches = re.findall(r'Generation\s+Srvc\s+Chrg\S*\s+(\d[\d,.]+)\s*kWh\s*X', text_joined, re.IGNORECASE)
        if gen_matches:
            result["kwh"] = int(sum(float(v.replace(",", "")) for v in gen_matches))

    if not result["kwh"]:
        # "Current Usage ... NNN Actual"
        kwh_match2 = re.search(r'Current\s+Usage.*?(\d[\d,]+)\s+Actual', text_joined)
        if kwh_match2:
            result["kwh"] = int(kwh_match2.group(1).replace(",", ""))

    if not result["kwh"]:
        # "Total Electricity Use (kWh) NNN"
        kwh_match3 = re.search(r'Total\s+Electricity\s+Use\s*\(kWh\)\s+(\d[\d,]*)', text_joined)
        if kwh_match3:
            result["kwh"] = int(kwh_match3.group(1).replace(",", ""))

    # Extract delivery charges
    delivery_match = re.search(r'Subtotal Delivery Services\s*\$?([\d,]+\.\d{2})', text)
    if delivery_match:
        result["delivery"] = float(delivery_match.group(1).replace(",", ""))

    if not result["delivery"]:
        delivery_match2 = re.search(r'Delivery Services\s*\$?([\d,]+\.\d{2})', text)
        if delivery_match2:
            result["delivery"] = float(delivery_match2.group(1).replace(",", ""))

    # Extract supply/generation charges
    supply_match = re.search(r'Subtotal Supplier Services\s*\$?([\d,]+\.\d{2})', text)
    if supply_match:
        result["supply"] = float(supply_match.group(1).replace(",", ""))

    if not result["supply"]:
        supply_match2 = re.search(r'Electric Supply Services\s*\$?([\d,]+\.\d{2})', text)
        if supply_match2:
            result["supply"] = float(supply_match2.group(1).replace(",", ""))

    return result


OUTPUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "electric_69hpl.json")


def main():
    all_files = sorted([f for f in os.listdir(BASE) if "Statement" in f and f.endswith(".pdf")])

    # Load existing data and skip already-processed filenames
    existing = []
    if os.path.exists(OUTPUT):
        with open(OUTPUT) as fp:
            existing = json.load(fp)
    seen = {r["filename"] for r in existing}

    new_files = [f for f in all_files if f not in seen]
    if not new_files:
        print("No new statements found.")
        return

    new_results = []
    errors = []

    for f in new_files:
        filepath = os.path.join(BASE, f)
        try:
            text = extract_text(filepath)
            data = parse_statement(text, f)

            date_match = re.match(r'(\d{4}-\d{2}-\d{2})', f)
            if date_match:
                data["statement_date"] = date_match.group(1)

            if data["kwh"] is None:
                errors.append(f"  {f}: no kWh found")
            if data["supply"] is None:
                errors.append(f"  {f}: no supply found")
            if data["delivery"] is None:
                errors.append(f"  {f}: no delivery found")

            new_results.append(data)
        except Exception as e:
            errors.append(f"  {f}: ERROR {e}")

    if errors:
        print("WARNINGS:")
        for e in errors:
            print(e)
        print()

    results = existing + new_results
    print(f"New statements processed: {len(new_results)}")
    print(f"Total statements: {len(results)}")
    print(f"With kWh data: {sum(1 for r in results if r['kwh'] is not None)}")
    print(f"With supply data: {sum(1 for r in results if r['supply'] is not None)}")
    print(f"With delivery data: {sum(1 for r in results if r['delivery'] is not None)}")

    with open(OUTPUT, "w") as fp:
        json.dump(results, fp, indent=2)
    print(f"\nData written to {OUTPUT}")


if __name__ == "__main__":
    main()

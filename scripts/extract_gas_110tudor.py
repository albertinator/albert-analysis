#!/usr/bin/env python3
"""Extract natural gas usage data from National Grid statements for 110 Tudor St."""

import pymupdf
import os
import re
import json
from datetime import datetime

BASE = "/Users/albert/albert_git_repos/albert-business/property_110_tudor_st/service_providers/national_grid_gas"


def extract_text_normal(filepath):
    doc = pymupdf.open(filepath)
    if doc.is_encrypted:
        for pw in ["02127", "02127-2641"]:
            if doc.authenticate(pw):
                break
        else:
            doc.close()
            return None
    text = ""
    for page in doc:
        text += page.get_text(sort=True)
    doc.close()
    return text


def extract_text_decoded(filepath):
    doc = pymupdf.open(filepath)
    pages_text = []
    for page in doc:
        blocks = page.get_text("rawdict")["blocks"]
        full_text = []
        for block in blocks:
            if "lines" in block:
                for line in block["lines"]:
                    line_chars = []
                    for span in line["spans"]:
                        for c in span.get("chars", []):
                            code = ord(c["c"])
                            new_code = code + 29
                            if new_code > 126:
                                new_code = new_code - 95
                            line_chars.append(chr(new_code))
                    full_text.append("".join(line_chars))
        pages_text.append("\n".join(full_text))
    doc.close()
    return "\n".join(pages_text)


def is_garbled(filepath):
    doc = pymupdf.open(filepath)
    if doc.is_encrypted:
        for pw in ["02127", "02127-2641"]:
            if doc.authenticate(pw):
                break
        else:
            doc.close()
            return False  # can't read it at all
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return not ("therm" in text.lower() or "Delivery" in text or "DELIVERY" in text)


def parse_statement(text, filename):
    result = {"filename": filename, "therms": None, "supply": None, "delivery": None,
              "period_start": None, "period_end": None}

    text_joined = re.sub(r'\n', ' ', text)

    # --- Extract billing period ---
    # New format: "Oct 1, 2025 to Oct 30, 2025"
    period_match = re.search(r'(\w+ \d{1,2},?\s*\d{4})\s+to\s+(\w+ \d{1,2},?\s*\d{4})', text_joined)
    if period_match:
        for fmt in ["%B %d, %Y", "%B %d,%Y", "%b %d, %Y", "%b %d,%Y"]:
            try:
                result["period_start"] = datetime.strptime(period_match.group(1).strip(), fmt).strftime("%Y-%m-%d")
                result["period_end"] = datetime.strptime(period_match.group(2).strip(), fmt).strftime("%Y-%m-%d")
                break
            except:
                continue

    # Old format: extract from meter read dates like "07/06/2009 reading" and "06/01/2009 reading"
    if not result["period_end"]:
        reads = re.findall(r'(\d{2}/\d{2}/\d{4})\s+reading', text_joined)
        if len(reads) >= 2:
            try:
                dates = [datetime.strptime(d, "%m/%d/%Y") for d in reads[:2]]
                dates.sort()
                result["period_start"] = dates[0].strftime("%Y-%m-%d")
                result["period_end"] = dates[1].strftime("%Y-%m-%d")
            except:
                pass

    # --- Extract therms ---
    # Old format: "In NN days you used NNN therms"
    therms_match = re.search(r'In\s+\d+\s+days\s+you\s+used\s+(\d+)\s+therms', text_joined)
    if therms_match:
        result["therms"] = int(therms_match.group(1))

    if result["therms"] is None:
        # Old format: "Total therms used NNN"
        therms_match2 = re.search(r'Total\s+therms\s+used\s+(\d+)', text_joined)
        if therms_match2:
            result["therms"] = int(therms_match2.group(1))

    if result["therms"] is None:
        # New format: "x NN therms" in charge lines - grab from the first delivery line
        # Could be fractional: "x 8.77 therms"
        therms_matches = re.findall(r'x\s+([\d.]+)\s+therms', text_joined)
        if therms_matches:
            result["therms"] = round(float(therms_matches[0]))

    if result["therms"] is None:
        # New format: Therms Used column value (after "Therm Factor = NNN")
        therms_match3 = re.search(r'Therm\s*Factor\s*=?\s*[\d.]+\s+(\d+)', text_joined)
        if therms_match3:
            result["therms"] = int(therms_match3.group(1))

    # --- Extract delivery ---
    # Old format: "GAS DELIVERY CHARGE $XX.XX"
    delivery_match = re.search(r'GAS\s+DELIVERY\s+CHARGE\s+\$?([\d,]+\.\d{2})', text_joined)
    if delivery_match:
        result["delivery"] = float(delivery_match.group(1).replace(",", ""))

    if result["delivery"] is None:
        # New format: "Total Delivery Services $ XX.XX"
        delivery_match2 = re.search(r'Total\s+Delivery\s+Services\s+\$?\s*([\d,]+\.\d{2})', text_joined)
        if delivery_match2:
            result["delivery"] = float(delivery_match2.group(1).replace(",", ""))

    # --- Extract supply ---
    # Old format: "GAS SUPPLY CHARGE ... $XX.XX" or "@ $.XXXXX /therm XX.XX"
    # The supply charge value appears after the rate line
    supply_match = re.search(r'GAS\s+SUPPLY\s+CHARGE.*?(?:@.*?/therm\s+)?\$?([\d,]+\.\d{2})', text_joined)
    if supply_match:
        result["supply"] = float(supply_match.group(1).replace(",", ""))

    if result["supply"] is None:
        # New format: "Total Supply Services $ XX.XX"
        supply_match2 = re.search(r'Total\s+Supply\s+Services\s+\$?\s*([\d,]+\.\d{2})', text_joined)
        if supply_match2:
            result["supply"] = float(supply_match2.group(1).replace(",", ""))

    return result


def main():
    files = sorted([f for f in os.listdir(BASE) if "Statement" in f and f.endswith(".pdf")])

    results = []
    errors = []

    for f in files:
        filepath = os.path.join(BASE, f)
        try:
            garbled = is_garbled(filepath)
            if garbled:
                text = extract_text_decoded(filepath)
            else:
                text = extract_text_normal(filepath)

            if text is None:
                errors.append(f"  {f}: could not decrypt")
                continue

            data = parse_statement(text, f)

            date_match = re.match(r'(\d{4}-\d{2}-\d{2})', f)
            if date_match:
                data["statement_date"] = date_match.group(1)

            if data["therms"] is None:
                errors.append(f"  {f}: no therms found")
            if data["supply"] is None:
                errors.append(f"  {f}: no supply found")
            if data["delivery"] is None:
                errors.append(f"  {f}: no delivery found")

            results.append(data)
        except Exception as e:
            errors.append(f"  {f}: ERROR {e}")

    if errors:
        print("WARNINGS:")
        for e in errors:
            print(e)
        print()

    print(f"Total statements processed: {len(results)}")
    print(f"With therms data: {sum(1 for r in results if r['therms'] is not None)}")
    print(f"With supply data: {sum(1 for r in results if r['supply'] is not None)}")
    print(f"With delivery data: {sum(1 for r in results if r['delivery'] is not None)}")

    with open("/Users/albert/albert_git_repos/gas_data_110tudor.json", "w") as fp:
        json.dump(results, fp, indent=2)
    print("\nData written to gas_data_110tudor.json")


if __name__ == "__main__":
    main()

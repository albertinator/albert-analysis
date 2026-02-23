#!/usr/bin/env python3
"""Extract electricity usage data from NStar/Eversource statements and generate a chart."""

import pymupdf
import os
import re
import json
from datetime import datetime

BASE = "/Users/albert/albert_git_repos/albert-business/property_110_tudor_st/service_providers/eversource_electric"

def extract_text_normal(filepath):
    """Extract text normally from PDF with sort=True for proper column alignment."""
    doc = pymupdf.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text(sort=True)
    doc.close()
    return text

def extract_text_decoded(filepath):
    """Extract text from garbled PDFs using +29 ASCII offset decoding."""
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
    """Check if PDF has garbled text."""
    text = extract_text_normal(filepath)
    return not ("kWh" in text or "KWH" in text or "Delivery" in text)

def parse_statement(text, filename):
    """Parse kWh, supply $, and delivery $ from statement text."""
    result = {"filename": filename, "kwh": None, "supply": None, "delivery": None, "period_start": None, "period_end": None}

    # Extract billing period
    # Patterns: "June 10, 2009 to June 18, 2009" or "January 20, 2015 to February 17, 2015"
    # or "Service from 04/17/20 - 05/18/20"
    period_match = re.search(r'(\w+ \d{1,2}, \d{4})\s+to\s+(\w+ \d{1,2}, \d{4})', text)
    if period_match:
        try:
            result["period_start"] = datetime.strptime(period_match.group(1), "%B %d, %Y").strftime("%Y-%m-%d")
            result["period_end"] = datetime.strptime(period_match.group(2), "%B %d, %Y").strftime("%Y-%m-%d")
        except:
            pass

    if not result["period_end"]:
        period_match2 = re.search(r'Service from (\d{2}/\d{2}/\d{2})\s*-\s*(\d{2}/\d{2}/\d{2})', text)
        if period_match2:
            try:
                result["period_start"] = datetime.strptime(period_match2.group(1), "%m/%d/%y").strftime("%Y-%m-%d")
                result["period_end"] = datetime.strptime(period_match2.group(2), "%m/%d/%y").strftime("%Y-%m-%d")
            except:
                pass

    if not result["period_end"]:
        # Try "Service from 12/19/25 - 01/20/26  33 Days" format
        period_match3 = re.search(r'Service from (\d{2}/\d{2}/\d{2})\s*-\s*(\d{2}/\d{2}/\d{2})\s+\d+ Days', text)
        if period_match3:
            try:
                result["period_start"] = datetime.strptime(period_match3.group(1), "%m/%d/%y").strftime("%Y-%m-%d")
                result["period_end"] = datetime.strptime(period_match3.group(2), "%m/%d/%y").strftime("%Y-%m-%d")
            except:
                pass

    # Normalize text: collapse multi-line tokens for easier matching
    # Join lines to make patterns easier to match
    text_joined = re.sub(r'\n', ' ', text)

    # Extract kWh - multiple patterns
    # "Total Electricity Use (kWh)" followed by number
    kwh_match = re.search(r'Total\s+Electricity\s+Use\s*\(kWh\)\s+(\d[\d,]*)', text_joined)
    if kwh_match:
        result["kwh"] = int(kwh_match.group(1).replace(",", ""))

    if not result["kwh"]:
        # "X Day Billed Use  NNN"
        kwh_match2 = re.search(r'\d+\s+Day\s+Billed\s+Use\s+(\d[\d,]*)', text_joined)
        if kwh_match2:
            result["kwh"] = int(kwh_match2.group(1).replace(",", ""))

    if not result["kwh"]:
        # Current Usage column: look for meter read pattern
        kwh_match3 = re.search(r'Current\s+Usage.*?(\d[\d,]+)\s+Actual', text_joined)
        if kwh_match3:
            result["kwh"] = int(kwh_match3.group(1).replace(",", ""))

    if not result["kwh"]:
        # "Billed Use NNN Generation" pattern (multi-line joined)
        kwh_match5 = re.search(r'Billed\s+Use\s+(\d[\d,]+)\s+Generation', text_joined)
        if kwh_match5:
            result["kwh"] = int(kwh_match5.group(1).replace(",", ""))

    if not result["kwh"]:
        # "NNN kWh X .NNNNN" pattern from generation charge line
        kwh_match4 = re.search(r'Generation\s+(?:Service\s+)?Charge.*?(\d[\d,]+)\s*kWh\s*X', text_joined, re.IGNORECASE)
        if kwh_match4:
            result["kwh"] = int(kwh_match4.group(1).replace(",", ""))

    if not result["kwh"]:
        # Last resort: look for "NNN KWH" pattern near delivery/generation sections
        kwh_match6 = re.search(r'(\d[\d,]+)\s+KWH\s+.*?Delivery\s+Services', text_joined)
        if kwh_match6:
            result["kwh"] = int(kwh_match6.group(1).replace(",", ""))

    if not result["kwh"]:
        # Fallback: find "NNN KWH  X.XX" in charge line items
        kwh_match7 = re.search(r'(\d[\d,]*)\s+KWH\s+(\d[\d,]*\.\d{2})', text_joined)
        if kwh_match7:
            result["kwh"] = int(kwh_match7.group(1).replace(",", ""))

    # Extract delivery charges
    # "Delivery Charges Total" ... "$XX.XX" or just number
    delivery_match = re.search(r'Delivery\s*(?:Charges\s*)?Total[\s.]*\$?([\d,]+\.\d{2})', text)
    if delivery_match:
        result["delivery"] = float(delivery_match.group(1).replace(",", ""))

    if not result["delivery"]:
        # "Subtotal Delivery Services" ... "$XX.XX"
        delivery_match2 = re.search(r'Subtotal Delivery Services\s*\$?([\d,]+\.\d{2})', text)
        if delivery_match2:
            result["delivery"] = float(delivery_match2.group(1).replace(",", ""))

    if not result["delivery"]:
        # "Delivery Services" ... "$XX.XX" in account summary
        delivery_match3 = re.search(r'Delivery Services\s*\$?([\d,]+\.\d{2})', text)
        if delivery_match3:
            result["delivery"] = float(delivery_match3.group(1).replace(",", ""))

    # Extract supply/generation charges
    gen_match = re.search(r'Generation\s*(?:Charges|Total)[\s.]*\$?([\d,]+\.\d{2})', text)
    if gen_match:
        result["supply"] = float(gen_match.group(1).replace(",", ""))

    if not result["supply"]:
        gen_match2 = re.search(r'Subtotal Supplier Services\s*\$?([\d,]+\.\d{2})', text)
        if gen_match2:
            result["supply"] = float(gen_match2.group(1).replace(",", ""))

    if not result["supply"]:
        gen_match3 = re.search(r'Electric Supply Services\s*\$?([\d,]+\.\d{2})', text)
        if gen_match3:
            result["supply"] = float(gen_match3.group(1).replace(",", ""))

    if not result["supply"]:
        # "Generation Service Charge NNN kWh X .NNNNN $XX.XX"
        gen_match4 = re.search(r'Generation Service Charge\s+\d[\d,]* kWh X \.\d+\s*\$?([\d,]+\.\d{2})', text)
        if gen_match4:
            result["supply"] = float(gen_match4.group(1).replace(",", ""))

    # For very early bills (2009) where generation is "Basic Svc Fixed .XXXXX X NN KWH  X.XX"
    if not result["supply"]:
        gen_match5 = re.search(r'Basic Svc Fixed\s+\.?\d+\s*X?\s*\d+\s*KWH\s+([\d,]+\.\d{2})', text)
        if gen_match5:
            result["supply"] = float(gen_match5.group(1).replace(",", ""))

    return result


OUTPUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "electric_110_tudor.json")


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
            garbled = is_garbled(filepath)
            if garbled:
                text = extract_text_decoded(filepath)
            else:
                text = extract_text_normal(filepath)

            data = parse_statement(text, f)

            # Use filename date as fallback for period
            date_match = re.match(r'(\d{4}-\d{2}-\d{2})', f)
            if date_match:
                data["statement_date"] = date_match.group(1)

            if data["kwh"] is None:
                errors.append(f"  {f}: no kWh found")

            new_results.append(data)
        except Exception as e:
            errors.append(f"  {f}: ERROR {e}")

    if errors:
        print("WARNINGS:")
        for e in errors:
            print(e)
        print()

    results = existing + new_results
    # Output as JSON for charting
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

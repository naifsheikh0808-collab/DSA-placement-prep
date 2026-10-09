import json
import re
import openpyxl

def slugify(text):
    if not text:
        return ""
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

TOP_COMPANY_PRIORITY = {
    'google': 1,
    'amazon': 2,
    'meta': 3,
    'facebook': 3,
    'microsoft': 4,
    'apple': 5,
    'netflix': 6,
    'nvidia': 7,
    'uber': 8,
    'bloomberg': 9,
    'linkedin': 10,
    'salesforce': 11,
    'adobe': 12,
    'twitter': 13,
    'x': 13,
    'atlassian': 14,
    'goldman sachs': 15,
    'jpmorgan': 16,
    'morgan stanley': 17,
    'oracle': 18,
    'airbnb': 19,
    'stripe': 20,
    'bytedance': 21,
    'tiktok': 21,
    'tcs': 22,
    'infosys': 23,
    'wipro': 24,
    'accenture': 25
}

def get_company_rank(c_name):
    clean = str(c_name).strip().lower()
    return TOP_COMPANY_PRIORITY.get(clean, 999)

def main():
    print("Loading Excel file...")
    wb = openpyxl.load_workbook(r'n:\placement preparation website\(Pattern wise) leetcode_company_questions.xlsx', read_only=True)

    # 1. Parse All Questions sheet to collect company metrics & recency timeframes
    ws_all = wb['All Questions']
    companies_dict = {}
    problem_company_map = {} # prob_id -> list of company info
    prob_timeframe_map = {} # prob_id -> set of timeframes

    timeframe_norm = {
        '30 days': '30d',
        '0-30 days': '30d',
        '30d': '30d',
        '3 months': '3m',
        '1-3 months': '3m',
        '3m': '3m',
        '6 months': '6m',
        '1-6 months': '6m',
        '3-6 months': '6m',
        '6m': '6m',
        'more than 6 months': '6m+',
        '>6 months': '6m+',
        '6m+': '6m+',
        'all time': 'all',
        'all': 'all',
    }

    row_idx = 0
    tf_counts = {}

    for row in ws_all.iter_rows(min_row=2, values_only=True):
        row_idx += 1
        comp_name, timeframe_raw, prob_id, title, diff, accept, freq, pattern, match_type, url = row[:10]

        if not comp_name or not prob_id:
            continue

        comp_name = str(comp_name).strip()
        comp_slug = slugify(comp_name)
        prob_id_str = str(prob_id).strip()
        diff_str = str(diff).strip() if diff else "Medium"
        raw_tf_clean = str(timeframe_raw).strip().lower() if timeframe_raw else '6m'
        tf_str = timeframe_norm.get(raw_tf_clean, '6m')
        tf_counts[tf_str] = tf_counts.get(tf_str, 0) + 1

        # Accumulate Company metrics
        if comp_slug not in companies_dict:
            companies_dict[comp_slug] = {
                "id": comp_slug,
                "name": comp_name,
                "normalizedName": comp_slug,
                "problemCount": 0,
                "easyCount": 0,
                "mediumCount": 0,
                "hardCount": 0,
                "topPatterns": set(),
                "timeframesAvailable": set(),
                "prob_set": set()
            }

        c = companies_dict[comp_slug]
        if prob_id_str not in c["prob_set"]:
            c["prob_set"].add(prob_id_str)
            c["problemCount"] += 1
            if diff_str == "Easy":
                c["easyCount"] += 1
            elif diff_str == "Hard":
                c["hardCount"] += 1
            else:
                c["mediumCount"] += 1

        if pattern and str(pattern).strip():
            c["topPatterns"].add(str(pattern).strip())
        c["timeframesAvailable"].add(tf_str)

        if prob_id_str not in problem_company_map:
            problem_company_map[prob_id_str] = set()
        problem_company_map[prob_id_str].add(comp_name)

        if prob_id_str not in prob_timeframe_map:
            prob_timeframe_map[prob_id_str] = set()
        prob_timeframe_map[prob_id_str].add(tf_str)

    print(f"Processed {row_idx} entries across {len(companies_dict)} companies.")
    print("Timeframe distribution across entries:", tf_counts)

    # 2. Parse Problem Summary sheet
    ws_sum = wb['Problem Summary']
    problems = []

    prob_tf_counts = {'30d': 0, '3m': 0, '6m': 0, '6m+': 0, 'all': 0}

    for row in ws_sum.iter_rows(min_row=2, values_only=True):
        prob_id, title, diff, accept, pattern, match_type, comp_count, comps_raw, url = row[:9]

        if not prob_id or not title:
            continue

        prob_id_str = str(prob_id).strip()
        title_str = str(title).strip()
        slug_str = slugify(title_str)
        diff_str = str(diff).strip() if diff else "Medium"

        try:
            accept_val = float(accept) if accept is not None else 50.0
            if accept_val <= 1.0:
                accept_val = round(accept_val * 100, 1)
        except:
            accept_val = 50.0

        comp_set = problem_company_map.get(prob_id_str, set())
        if not comp_set and comps_raw:
            comp_set = {c.strip() for c in str(comps_raw).split(',') if c.strip()}

        # Sort companies: Top tech companies (Google, Amazon, Meta, Apple, Nvidia) first!
        sorted_comps = sorted(list(comp_set), key=lambda c: (get_company_rank(c), c))

        tf_list = list(prob_timeframe_map.get(prob_id_str, ["6m"]))
        for t in tf_list:
            if t in prob_tf_counts:
                prob_tf_counts[t] += 1

        pat_str = str(pattern).strip() if pattern else "General DSA"

        num_comps = len(sorted_comps)
        diff_weight = 1.2 if diff_str == "Hard" else (1.0 if diff_str == "Medium" else 0.8)
        priority_score = round((num_comps * 1.5 + (100 - accept_val) * 0.2) * diff_weight, 1)

        problems.append({
            "id": prob_id_str,
            "externalId": prob_id_str,
            "title": title_str,
            "slug": slug_str,
            "difficulty": diff_str,
            "acceptanceRate": accept_val,
            "canonicalUrl": str(url).strip() if url else f"https://leetcode.com/problems/{slug_str}/",
            "platform": "leetcode",
            "companyCount": num_comps,
            "companies": sorted_comps,
            "timeframes": tf_list,
            "primaryPattern": pat_str,
            "secondaryPatterns": [],
            "frequency": round(num_comps * 2.5, 1),
            "priorityScore": priority_score,
        })

    print(f"Processed {len(problems)} unique problems.")
    print("Unique problems by timeframe:", prob_tf_counts)

    # Convert company sets to lists for JSON
    companies_list = []
    for comp in companies_dict.values():
        companies_list.append({
            "id": comp["id"],
            "name": comp["name"],
            "normalizedName": comp["normalizedName"],
            "problemCount": comp["problemCount"],
            "easyCount": comp["easyCount"],
            "mediumCount": comp["mediumCount"],
            "hardCount": comp["hardCount"],
            "topPatterns": list(comp["topPatterns"])[:5],
            "timeframesAvailable": list(comp["timeframesAvailable"]),
        })

    companies_list.sort(key=lambda x: x["problemCount"], reverse=True)
    problems.sort(key=lambda x: x["priorityScore"], reverse=True)

    dataset = {
        "companies": companies_list,
        "problems": problems
    }

    out_path = r'n:\placement preparation website\dsa-forge\src\lib\data\generated_dataset.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2)

    print(f"Successfully generated dataset at {out_path}")

if __name__ == '__main__':
    main()

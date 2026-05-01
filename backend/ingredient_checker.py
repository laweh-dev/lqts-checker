from data_loader import get_risk
from llm_handler import extract_ingredients


def check_medicine(medicine_name: str) -> dict:
    ingredients = extract_ingredients(medicine_name)

    if not ingredients:
        return {
            "medicine": medicine_name,
            "ingredients": [],
            "overall_verdict": "unknown",
            "plain_english": "Could not identify any active ingredients. Please check the medicine name and try again."
        }

    results = []
    for ingredient in ingredients:
        risk = get_risk(ingredient)
        if risk == "not_found":
            results.append({
                "ingredient_name": ingredient,
                "risk_category": "not_found",
                "common_brand_name": "",
                "notes": "Not found in QT risk database — likely safe"
            })
        else:
            results.append({
                "ingredient_name": ingredient,
                "risk_category": risk.get("risk_category", "unknown"),
                "common_brand_name": risk.get("common_brand_name", ""),
                "notes": risk.get("use_case", "")
            })

    risk_levels = [r["risk_category"] for r in results]

    if "Known Risk of TdP" in risk_levels:
        verdict = "avoid"
        summary = f"One or more ingredients in {medicine_name} carry a known risk of heart rhythm problems for people with LQTS. Do not take without speaking to your cardiologist first."
    elif "Conditional Risk of TdP" in risk_levels:
        verdict = "caution"
        summary = f"{medicine_name} contains an ingredient with a conditional QT risk. Speak to your Cardiologist before taking."
    elif "Possible Risk of TdP" in risk_levels:
        verdict = "caution"
        summary = f"{medicine_name} contains an ingredient with a possible QT risk. We recommend avoiding this, but please check with your Cardiologist first."
    elif "Special Risk of TdP" in risk_levels:
        verdict = "avoid"
        summary = f"{medicine_name} contains an ingredient with a special QT risk. Do not take this without speaking to your Cardiologist first."
    else:
        verdict = "no known risk"
        summary = f"No known QT prolongation risk found for the active ingredients in {medicine_name}. As always, check with your cardiologist if you are unsure."

    return {
        "medicine": medicine_name,
        "ingredients": results,
        "overall_verdict": verdict,
        "plain_english": summary
    }


if __name__ == "__main__":
    import json

    tests = ["Macrolides", "Benadryl", "Imodium", "Loratadine", "Cetirizine hydrochloride", "Klaricid"]

    for medicine in tests:
        print(f"\n--- {medicine} ---")
        result = check_medicine(medicine)
        print(f"Verdict: {result['overall_verdict'].upper()}")
        print(f"Summary: {result['plain_english']}")
        print("Ingredients:")
        for ing in result["ingredients"]:
            print(f"  - {ing['ingredient_name']}: {ing['risk_category']}")
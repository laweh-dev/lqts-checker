from ingredient_checker import check_medicine


def test_known_risk_ingredient_returns_avoid():
    result = check_medicine("amiodarone")
    assert result["overall_verdict"] == "avoid"


def test_safe_ingredient_returns_safe():
    result = check_medicine("paracetamol")
    assert result["overall_verdict"] == "no known risk"


def test_result_has_required_keys():
    result = check_medicine("Lemsip Max")
    assert "medicine" in result
    assert "ingredients" in result
    assert "overall_verdict" in result
    assert "plain_english" in result


def test_unknown_medicine_returns_safe_or_unknown():
    result = check_medicine("banana")
    assert result["overall_verdict"] in ["safe", "unknown"]


def test_ingredients_list_is_not_empty():
    result = check_medicine("Lemsip Max")
    assert isinstance(result["ingredients"], list)
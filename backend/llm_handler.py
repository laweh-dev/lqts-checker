import json
import os
import re
from typing import List

from anthropic import Anthropic
from dotenv import load_dotenv


SYSTEM_PROMPT = """You extract ONLY active medical ingredient names from user-provided medicine names or unstructured text.

You MUST reply with ONLY a valid JSON array of strings, lowercase.
No explanations, no extra text, no markdown—only the JSON array.

If you cannot confidently identify any active ingredients, reply with [].
"""

_JSON_ARRAY_RE = re.compile(r"\[[\s\S]*\]")


def _parse_json_array(text: str) -> List[str]:
    """
    Parse a JSON array of strings from the model output.
    If extra text appears, attempt to extract the first JSON array substring.
    """
    text = (text or "").strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        m = _JSON_ARRAY_RE.search(text)
        if not m:
            raise
        data = json.loads(m.group(0))

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array from model.")

    out: List[str] = []
    seen = set()
    for item in data:
        if not isinstance(item, str):
            continue
        s = item.strip().lower()
        if not s or s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def extract_ingredients(text: str) -> List[str]:
    """
    Extract active ingredients from a medicine name or unstructured text using Anthropic.

    Loads ANTHROPIC_API_KEY from a .env file using python-dotenv.
    Returns a parsed list of lowercase ingredient strings.
    """
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not found (expected in environment or .env).")

    client = Anthropic(api_key=api_key)
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        temperature=0,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": text}],
    )

    parts = []
    for block in resp.content:
        if getattr(block, "type", None) == "text":
            parts.append(getattr(block, "text", ""))
    raw = "".join(parts).strip()

    return _parse_json_array(raw)

#testing the llm_handler.py function
if __name__ == "__main__":
    results = extract_ingredients("Lemsip")
    print("Lemsip:", results)

    results = extract_ingredients("I want to take ibuprofen and pseudoephedrine")
    print("Mixed:", results)

    results = extract_ingredients("banana")
    print("Nonsense:", results)
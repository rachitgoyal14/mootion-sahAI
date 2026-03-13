import json
import re

def extract_json(text: str) -> dict:
    """
    Extract and parse the first valid JSON object from LLM output.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("No JSON object found in LLM output")
        return json.loads(match.group())

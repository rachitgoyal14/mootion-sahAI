def build_generate_code_prompt(
    concept: str,
    learning_goals: list,
    level: str
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()

    if level == "beginner":
        rules = """
Level: BEGINNER
- Generate a simple and obvious mistake
- Code should be short and readable
- Mistake should block correct execution or logic
"""
    elif level == "intermediate":
        rules = """
Level: INTERMEDIATE
- Generate a subtle but clear logical error
- Code should mostly look correct
- Mistake should relate to the core concept
"""
    else:
        rules = """
Level: ADVANCED
- Generate a non-trivial or edge-case mistake
- Code should be structurally correct
- Mistake should require deep understanding to catch
"""

    return f"""
You are generating a Find-the-Mistake coding challenge.

Concept: {concept}

Learning goals:
{goals}

{rules}

Instructions:
- Generate a code snippet that contains EXACTLY ONE mistake.
- The mistake must be directly related to the concept.
- Do NOT explain the mistake.
- Do NOT include comments that hint at the mistake.

Return JSON ONLY in this format:
{{
  "artifact_type": "code",
  "content": "code snippet as plain text",
  "metadata": {{
    "language": "python"
  }}
}}
"""



def build_evaluate_code_prompt(
    concept: str,
    learning_goals: list,
    level: str,
    artifact_content: str,
    learner_fix: str,
    explanation: str | None
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()

    if level == "beginner":
        strictness = """
Evaluation strictness:
- Accept partially correct fixes
- Focus on whether the core issue was identified
"""
    elif level == "intermediate":
        strictness = """
Evaluation strictness:
- Expect correct fix and explanation
- Penalize vague or incomplete fixes
"""
    else:
        strictness = """
Evaluation strictness:
- Expect precise and correct fix
- Penalize missing edge cases or incorrect assumptions
"""

    explanation_text = explanation if explanation else "No explanation provided."

    return f"""
You are evaluating a learner correcting a code mistake.

Concept: {concept}

Learning goals:
{goals}

{strictness}

Original flawed code:
\"\"\"{artifact_content}\"\"\"

Learner's corrected version or description:
\"\"\"{learner_fix}\"\"\"

Learner's explanation:
\"\"\"{explanation_text}\"\"\"

Instructions:
- Decide if the learner correctly identified and fixed the mistake.
- Do NOT suggest improvements beyond the single mistake.
- Do NOT teach the concept.
- Be strict according to the learner level.

Return JSON ONLY in this format:
{{
  "correct": true,
  "feedback": [
    "short, specific feedback sentence"
  ],
  "follow_up_question": "one question probing understanding if incorrect, otherwise null"
}}
"""

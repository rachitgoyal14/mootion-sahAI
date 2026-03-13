def build_generate_latex_prompt(
    concept: str,
    learning_goals: list,
    level: str
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()

    if level == "beginner":
        rules = """
Level: BEGINNER
- Generate a short, step-by-step derivation
- Introduce ONE clear and visible mathematical mistake
- Mistake should be easy to spot (wrong operation, missing term)
"""
    elif level == "intermediate":
        rules = """
Level: INTERMEDIATE
- Generate a multi-step derivation
- Introduce ONE subtle but meaningful mistake
- Mistake should affect correctness but not look obvious
"""
    else:
        rules = """
Level: ADVANCED
- Generate a rigorous derivation or transformation
- Introduce ONE deep conceptual or algebraic mistake
- Mistake should require careful inspection to detect
"""

    return f"""
You are generating a Find-the-Mistake math challenge.

Concept: {concept}

Learning goals:
{goals}

{rules}

Instructions:
- Produce a LaTeX-formatted, step-by-step derivation.
- Include EXACTLY ONE incorrect step.
- Do NOT explain where the mistake is.
- Do NOT include comments or hints.

Return JSON ONLY in this format:
{{
  "artifact_type": "latex",
  "content": "LaTeX equations with steps separated by line breaks",
  "metadata": {{
    "format": "latex"
  }}
}}
"""



def build_evaluate_latex_prompt(
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
- Accept identification of the incorrect step
- Minor wording mistakes are acceptable
- Focus on whether the learner spotted the wrong logic
"""
    elif level == "intermediate":
        strictness = """
Evaluation strictness:
- Expect correct identification AND explanation
- Penalize incomplete or imprecise reasoning
"""
    else:
        strictness = """
Evaluation strictness:
- Expect precise mathematical reasoning
- Penalize missing assumptions or incorrect justifications
"""

    explanation_text = explanation if explanation else "No explanation provided."

    return f"""
You are evaluating a learner identifying a mistake in a mathematical derivation.

Concept: {concept}

Learning goals:
{goals}

{strictness}

Flawed derivation (LaTeX):
\"\"\"{artifact_content}\"\"\"

Learner's correction or identified mistake:
\"\"\"{learner_fix}\"\"\"

Learner's explanation:
\"\"\"{explanation_text}\"\"\"

Instructions:
- Decide if the learner correctly identified the incorrect step.
- The learner does NOT need to rewrite the full derivation.
- Do NOT provide hints or teaching.
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

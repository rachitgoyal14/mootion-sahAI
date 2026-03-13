def build_generate_missing_link_prompt(
    concept: str,
    learning_goals: list,
    level: str,
    category: str
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()
    category = category.lower()

    # -----------------------
    # Level rules
    # -----------------------

    if level == "beginner":
        level_rules = "Use 2–3 simple missing slots."
    elif level == "intermediate":
        level_rules = "Use 3–4 reasoning-based missing slots."
    else:
        level_rules = "Use 4–5 subtle or closely related missing slots."

    # -----------------------
    # Category rules
    # -----------------------

    if category == "math":
        category_rules = """
Category: MATH
- Structure must involve equations or expressions
- Missing links should be numbers, operators, or algebraic steps
- Example: solving, simplifying, transforming expressions
"""
    elif category == "physics":
        category_rules = """
Category: PHYSICS
- Structure must involve physical quantities or laws
- Missing links should be variables, formulas, or causal relationships
- Example: force, velocity, acceleration, units
"""
    elif category == "biology":
        category_rules = """
Category: BIOLOGY
- Structure must represent a biological process or system
- Missing links should be stages, components, or functions
- Example: photosynthesis steps, cell organelles
"""
    elif category == "chemistry":
        category_rules = """
Category: CHEMISTRY
- Structure must involve reactions or chemical relationships
- Missing links should be compounds, coefficients, or steps
- Example: reaction balancing, reaction stages
"""
    else:  # computer_science
        category_rules = """
Category: COMPUTER SCIENCE
- Structure must represent logic, algorithms, or flow
- Missing links should be conditions, steps, or function calls
- Example: recursion, loops, control flow
"""

    return f"""
You are generating a "Complete the Missing Link" learning puzzle.

Concept: {concept}
Category: {category}

Learning goals:
{goals}

{level_rules}

{category_rules}

Instructions:
- Create a structured sequence with missing links.
- Each missing link must have a unique slot_id.
- Provide draggable options.
- Exactly ONE option must correctly fit each slot.
- Do NOT reveal the correct mapping.

Return JSON ONLY in this format:
{{
  "structure": [
    {{ "slot_id": "s1", "text": "Text with ____ missing" }},
    {{ "slot_id": "s2", "text": "Another ____ step" }}
  ],
  "options": [
    {{ "option_id": "o1", "text": "option text" }},
    {{ "option_id": "o2", "text": "option text" }},
    {{ "option_id": "o3", "text": "option text" }}
  ],
  "solution": {{
    "s1": "o2",
    "s2": "o1"
  }}
}}
"""

def build_evaluate_missing_link_prompt(
    concept: str,
    learning_goals: list,
    level: str,
    structure: list,
    options: list,
    solution: dict,
    learner_answers: dict
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()

    if level == "beginner":
        strictness = """
Evaluation strictness:
- Focus on whether the learner understands the basic structure
- Partial correctness is acceptable
"""
    elif level == "intermediate":
        strictness = """
Evaluation strictness:
- Expect correct conceptual mapping
- Penalize incorrect or inconsistent links
"""
    else:
        strictness = """
Evaluation strictness:
- Expect fully correct structural understanding
- Penalize any incorrect mapping
"""

    return f"""
You are evaluating a learner completing a structural "missing link" puzzle.

Concept: {concept}

Learning goals:
{goals}

{strictness}

Structure with slots:
{structure}

Available options:
{options}

Correct mapping (ground truth):
{solution}

Learner's submitted mapping:
{learner_answers}

Instructions:
- Compare learner answers against the correct mapping.
- Determine whether the learner correctly completed the structure.
- Do NOT teach or explain the concept.
- Be strict according to the learner level.

Return JSON ONLY in this format:
{{
  "correct": true,
  "feedback": [
    "short, specific feedback sentence"
  ],
  "follow_up_question": "one question probing weakest link if incorrect, otherwise null"
}}
"""

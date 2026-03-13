def build_generate_mermaid_prompt(
    concept: str,
    learning_goals: list,
    level: str
) -> str:
    goals = "\n".join([f"- {g}" for g in learning_goals])

    level = level.lower()

    if level == "beginner":
        rules = """
Level: BEGINNER
- Generate a simple Mermaid flowchart or graph
- Introduce ONE obvious structural or logical mistake
- Mistake should be easy to visually identify
"""
    elif level == "intermediate":
        rules = """
Level: INTERMEDIATE
- Generate a multi-node Mermaid diagram
- Introduce ONE subtle logical error
- Diagram should mostly appear correct
"""
    else:
        rules = """
Level: ADVANCED
- Generate a complex Mermaid diagram
- Introduce ONE deep logical or conceptual mistake
- Mistake should require careful reasoning to detect
"""

    return f"""
You are generating a Find-the-Mistake challenge using Mermaid diagrams.

Concept: {concept}

Learning goals:
{goals}

{rules}

Instructions:
- Generate a Mermaid diagram (flowchart or graph).
- Introduce EXACTLY ONE incorrect node, edge, or relationship.
- The mistake must be conceptually incorrect, not a syntax error.
- Do NOT explain or hint at the mistake.
- Do NOT include comments.

Return JSON ONLY in this format:
{{
  "artifact_type": "mermaid",
  "content": "valid Mermaid diagram code",
  "metadata": {{
    "diagram_type": "flowchart | graph"
  }}
}}
"""




def build_evaluate_mermaid_prompt(
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
- Accept identification of the incorrect node or edge
- Minor terminology errors are acceptable
"""
    elif level == "intermediate":
        strictness = """
Evaluation strictness:
- Expect correct identification and explanation
- Penalize vague or incomplete reasoning
"""
    else:
        strictness = """
Evaluation strictness:
- Expect precise identification of the flawed relationship
- Penalize missing logical implications or incorrect assumptions
"""

    explanation_text = explanation if explanation else "No explanation provided."

    return f"""
You are evaluating a learner correcting a Mermaid diagram mistake.

Concept: {concept}

Learning goals:
{goals}

{strictness}

Flawed Mermaid diagram:
\"\"\"{artifact_content}\"\"\"

Learner's correction or identified mistake:
\"\"\"{learner_fix}\"\"\"

Learner's explanation:
\"\"\"{explanation_text}\"\"\"

Instructions:
- Decide if the learner correctly identified the incorrect node, edge, or relationship.
- The learner does NOT need to rewrite the entire diagram.
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

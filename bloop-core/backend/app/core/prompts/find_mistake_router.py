from .find_mistake.code_prompt import (
    build_generate_code_prompt,
    build_evaluate_code_prompt
)
from .find_mistake.latex_prompt import (
    build_generate_latex_prompt,
    build_evaluate_latex_prompt
)
from .find_mistake.mermaid_prompt import (
    build_generate_mermaid_prompt,
    build_evaluate_mermaid_prompt
)


# --------------------------------------------------
# GENERATE ROUTER
# --------------------------------------------------

def build_generate_prompt(
    concept: str,
    learning_goals: list,
    level: str,
    mistake_type: str | None
) -> str:
    """
    Routes to the correct prompt builder for generation.
    """

    if mistake_type == "latex":
        return build_generate_latex_prompt(concept, learning_goals, level)

    if mistake_type == "mermaid":
        return build_generate_mermaid_prompt(concept, learning_goals, level)

    # default → code
    return build_generate_code_prompt(concept, learning_goals, level)


# --------------------------------------------------
# EVALUATION ROUTER
# --------------------------------------------------

def build_evaluate_prompt(
    concept: str,
    learning_goals: list,
    level: str,
    artifact_type: str,
    artifact_content: str,
    learner_fix: str,
    explanation: str | None
) -> str:
    """
    Routes to the correct prompt builder for evaluation.
    """

    if artifact_type == "latex":
        return build_evaluate_latex_prompt(
            concept, learning_goals, level, artifact_content, learner_fix, explanation
        )

    if artifact_type == "mermaid":
        return build_evaluate_mermaid_prompt(
            concept, learning_goals, level, artifact_content, learner_fix, explanation
        )

    # default → code
    return build_evaluate_code_prompt(
        concept, learning_goals, level, artifact_content, learner_fix, explanation
    )

import json
from typing import Optional

from services.llm_service import LLMService
from services.session_store import SessionStore
from services.learning_context_service import load_learning_context
from core.prompts.find_mistake_router import (
    build_generate_prompt,
    build_evaluate_prompt
)


class FindMistakeService:
    """
    Core logic for Find-the-Mistake Play game.
    """

    def __init__(self):
        self.llm = LLMService()
        self.session_store = SessionStore()

    # --------------------------------------------------
    # GENERATE PHASE
    # --------------------------------------------------

    def generate(
        self,
        concept_id: str,
        level: str,
        mistake_type: Optional[str] = None
    ) -> dict:
        """
        Generates a flawed artifact and stores it in session.
        """

        context = load_learning_context(concept_id)

        prompt = build_generate_prompt(
            concept=context["concept_name"],
            learning_goals=context["learning_goals"],
            level=level,
            mistake_type=mistake_type
        )

        response = self.llm.complete(prompt)

        try:
            result = json.loads(response)
        except Exception:
            raise ValueError("LLM returned invalid JSON during generation")

        artifact_type = result.get("artifact_type")
        content = result.get("content")
        metadata = result.get("metadata", {})

        if not artifact_type or not content:
            raise ValueError("Generated artifact is incomplete")

        session_id = self.session_store.create_session({
            "concept_id": concept_id,
            "level": level,
            "artifact_type": artifact_type,
            "content": content,
            "metadata": metadata
        })

        return {
            "session_id": session_id,
            "artifact_type": artifact_type,
            "content": content,
            "metadata": metadata
        }

    # --------------------------------------------------
    # EVALUATION PHASE
    # --------------------------------------------------

    def evaluate(
        self,
        session_id: str,
        learner_fix: str,
        explanation: Optional[str] = None
    ) -> dict:
        """
        Evaluates learner's correction against stored artifact.
        """

        session = self.session_store.get_session(session_id)

        context = load_learning_context(session["concept_id"])

        prompt = build_evaluate_prompt(
            concept=context["concept_name"],
            learning_goals=context["learning_goals"],
            level=session["level"],
            artifact_type=session["artifact_type"],
            artifact_content=session["content"],
            learner_fix=learner_fix,
            explanation=explanation
        )

        response = self.llm.complete(prompt)

        try:
            result = json.loads(response)
        except Exception:
            raise ValueError("LLM returned invalid JSON during evaluation")

        # Optionally clean up session after evaluation
        self.session_store.delete_session(session_id)

        return {
            "correct": result.get("correct", False),
            "feedback": result.get("feedback", []),
            "follow_up_question": result.get("follow_up_question")
        }

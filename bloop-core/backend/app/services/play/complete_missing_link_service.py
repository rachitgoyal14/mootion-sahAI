import json
from typing import Dict

from services.llm_service import LLMService
from services.session_store import SessionStore
from services.learning_context_service import load_learning_context
from core.prompts.complete_missing_link_prompt import (
    build_generate_missing_link_prompt,
    build_evaluate_missing_link_prompt
)


class CompleteMissingLinkService:
    """
    Core logic for Complete-the-Missing-Link Play game.
    """

    def __init__(self):
        self.llm = LLMService()
        self.session_store = SessionStore()

    # --------------------------------------------------
    # GENERATE PHASE
    # --------------------------------------------------

    def generate(self, concept_id: str, level: str, category: str) -> dict:
        context = load_learning_context(concept_id)

        prompt = build_generate_missing_link_prompt(
            concept=context["concept_name"],
            learning_goals=context["learning_goals"],
            level=level,
            category=category
        )

        response = self.llm.complete(prompt)

        try:
            result = json.loads(response)
        except Exception:
            raise ValueError("LLM returned invalid JSON during generation")

        structure = result.get("structure")
        options = result.get("options")
        solution = result.get("solution")

        if not structure or not options or not solution:
            raise ValueError("Generated missing-link puzzle is incomplete")

        session_id = self.session_store.create_session({
            "concept_id": concept_id,
            "level": level,
            "structure": structure,
            "options": options,
            "solution": solution
        })

        return {
            "session_id": session_id,
            "structure": structure,
            "options": options
        }

    # --------------------------------------------------
    # EVALUATION PHASE
    # --------------------------------------------------

    def evaluate(self, session_id: str, answers: Dict[str, str]) -> dict:
        session = self.session_store.get_session(session_id)

        solution = session["solution"]

        correct = True
        feedback = []

        for slot_id, correct_option in solution.items():
            chosen = answers.get(slot_id)

            if chosen != correct_option:
                correct = False
                feedback.append(
                    f"The selection for slot '{slot_id}' is incorrect."
                )

        if correct:
            feedback.append("All missing links were completed correctly.")

        # cleanup session
        self.session_store.delete_session(session_id)

        return {
            "correct": correct,
            "feedback": feedback,
            "follow_up_question": None if correct else "Review the incorrect links and try again."
        }

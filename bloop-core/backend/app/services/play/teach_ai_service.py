import json
from services.llm_service import LLMService
from core.prompts.teach_ai_prompt import (
    build_teach_ai_prompt,
    build_teach_ai_start_prompt
)
from services.learning_context_service import load_learning_context


class TeachAIService:
    def __init__(self):
        self.llm = LLMService()

    # -------------------------------------------------
    # 1️⃣ LLM INITIATES THE CONVERSATION
    # -------------------------------------------------

    def generate_first_question(self, concept_id: str, level: str) -> str:
        """
        Generates the first question that asks the user
        to explain the concept in their own words.
        """

        context = load_learning_context(concept_id)

        prompt = build_teach_ai_start_prompt(
            concept=context["concept_name"],
            learning_goals=context["learning_goals"],
            level=level
        )

        response = self.llm.complete(prompt)

        return response.strip()

    # -------------------------------------------------
    # 2️⃣ EVALUATE USER EXPLANATION
    # -------------------------------------------------

    def evaluate(
        self,
        concept_id: str,
        explanation: str,
        level: str,
        history: list | None = None
    ) -> dict:
        """
        Evaluates the user's explanation and returns
        structured scoring + feedback.
        """

        context = load_learning_context(concept_id)

        prompt = build_teach_ai_prompt(
            concept=context["concept_name"],
            learning_goals=context["learning_goals"],
            explanation=explanation,
            level=level,
            history=history or []
        )

        response = self.llm.complete(prompt)

        try:
            result = json.loads(response)
        except Exception:
            raise ValueError("LLM returned invalid JSON")

        scores = result.get("scores", {})
        feedback = result.get("feedback", [])
        follow_up = result.get("follow_up_question")

        max_score = len(context["learning_goals"]) * 2
        achieved = sum(scores.values()) if scores else 0

        return {
            "scores": scores,
            "feedback": feedback,
            "follow_up_question": follow_up,
            "passed": achieved / max_score >= 0.7 if max_score else False
        }

    # -------------------------------------------------
    # 3️⃣ SINGLE SOURCE RESPONSE FORMATTER
    # -------------------------------------------------

    def format_response(self, evaluation: dict) -> str:
        """
        Converts evaluation output into a natural
        assistant response (used for both text & TTS).
        """

        feedback_text = "\n".join(
            f"- {item}" for item in evaluation.get("feedback", [])
        )

        follow_up = evaluation.get("follow_up_question")

        response = (
            "Here’s my feedback on your explanation:\n\n"
            f"{feedback_text}\n\n"
        )

        if follow_up:
            response += f"Now, here’s a follow-up question for you:\n{follow_up}"

        return response.strip()

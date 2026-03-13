from groq import Groq
from core.config import settings


class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def complete(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a strict evaluator. Return JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        return response.choices[0].message.content

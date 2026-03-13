from services.document_content_service import get_document_chunks
from langchain_groq import ChatGroq
import json


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2
)

def generate_quiz(document_id: str, count: int = 5):
    chunks = get_document_chunks(document_id)

    context = "\n".join(chunks)

    prompt = f"""
You are an educational assistant.

Generate {count} multiple-choice questions (MCQs) from the document.

Rules:
- Each question must be answerable from the document
- Provide 4 options
- Exactly ONE option must be correct
- Do NOT add external knowledge
- Output ONLY valid JSON in the format:

[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "B"
  }}
]

Document content:
{context}
"""

    response = llm.invoke(prompt)
    
    # Parse the JSON response
    try:
        data = json.loads(response.content)
        return data
    except json.JSONDecodeError as e:
        print(f"Failed to parse quiz JSON: {e}")
        print(f"Raw response: {response.content}")
        # Return fallback data
        return [
            {
                "question": "Error generating quiz",
                "options": ["A) Please try again", "B) Check document content", "C) Upload a different document", "D) Contact support"],
                "correct_answer": "A"
            }
        ]
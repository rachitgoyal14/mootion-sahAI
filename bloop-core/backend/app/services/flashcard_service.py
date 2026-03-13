from services.document_content_service import get_document_chunks
from langchain_groq import ChatGroq
import json


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,

)

def generate_flashcards(document_id:str,count :int=10):
    chunks = get_document_chunks(document_id)
    context = "\n".join(chunks)

    prompt = f""" 
You are an educational assistant.
Generate {count} high-quality flashcard from the document content below.

Rules:
- Each flashcard must be ONE clear concept
- Questions should be concise
- Answers should be short and precise
- Do NOT add information not present in the document
- Output ONLY valid JSON in the following format:
[
{{"question": "...","answer":"..."}}
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
        print(f"Failed to parse flashcard JSON: {e}")
        print(f"Raw response: {response.content}")
        # Return fallback data
        return [
            {
                "question": "Error generating flashcards",
                "answer": "Please try again"
            }
        ]
from langchain_chroma import Chroma
from langchain_nomic import NomicEmbeddings
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from core.config import VECTOR_DB_DIR
from services.vision_service import extract_text_from_image

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    max_tokens=512,
    timeout=30,
    max_retries=2,
)


SUMMARY_KEYWORDS = [
    "summarize",
    "summary",
    "explain",
    "overview",
    "what is this document about",
    "key points",
    "gist",
    "ELI5"
]

def is_summary_question(question: str) -> bool:
    q = question.lower()
    return any(k in q for k in SUMMARY_KEYWORDS)


def extract_question_from_text(ocr_text: str) -> str:
    prompt = f"""
You are an educational assistant.

From the text below, extract the MAIN question being asked.
If multiple questions exist, pick the most relevant one.
If no clear question exists, rewrite the text into a clear question.

Return ONLY the question.

Text:
{ocr_text}

Question:
"""
    response = llm.invoke(prompt)
    return response.content.strip()


def build_llm_messages(context: list[dict], current_question: str) -> str:
    """
    Build conversation context for LLM
    
    Args:
        context: List of previous messages [{"role": "user/assistant", "content": "..."}]
        current_question: The current user question
    
    Returns:
        Formatted conversation history as string
    """
    if not context:
        return ""
    
    history = []
    for msg in context[-6:]:  # Last 6 messages for context window management
        role = msg["role"].capitalize()
        content = msg["content"]
        history.append(f"{role}: {content}")
    
    return "\n".join(history)


def answer_ques(
        question: str | None, 
        document_id: str | None = None,
        image_path: str | None = None,
        context: list[dict] | None = None
) -> str:
    """
    Answer questions with optional document context and conversation history
    
    Args:
        question: User's question
        document_id: Optional document ID for RAG
        image_path: Optional image path for OCR
        context: Conversation history [{"role": "user/assistant", "content": "..."}]
    
    Returns:
        Generated answer
    """
    
    # Handle image-based questions
    if image_path:
        ocr_text = extract_text_from_image(image_path)

        if not ocr_text.strip():
            return "I could not extract any readable text from the image."

        question = extract_question_from_text(ocr_text)

    if not question or not question.strip():
        return "No valid question could be determined."
    
    is_summary = is_summary_question(question)

    # Build conversation history
    conversation_history = ""
    if context:
        conversation_history = build_llm_messages(context, question)

    # RAG: Document-based answering
    if document_id:
        vector_db = Chroma(
            collection_name=document_id,
            embedding_function=NomicEmbeddings(
                model="nomic-embed-text-v1.5",
            ),
            persist_directory=VECTOR_DB_DIR,
        )

        retrieval_query = (
            "summary of the document"
            if is_summary
            else question
        )

        docs_with_score = vector_db.similarity_search_with_score(
            retrieval_query,
            k=12
        )

        for _, score in docs_with_score:
            print("Similarity score:", score)

        print("Collection:", document_id)
        print("DB path:", VECTOR_DB_DIR)
        print("Docs retrieved:", len(docs_with_score))

        if is_summary:
            docs = [doc for doc, _ in docs_with_score]
        else:
            docs = [
                doc for doc, score in docs_with_score
                if score < 0.6
            ]

        if not docs:
            return "I don't know."

        doc_context = "\n".join(doc.page_content for doc in docs)

        # Build prompt based on summary or specific question
        if is_summary:
            # Build conversation context separately to avoid backslash in f-string
            conv_prefix = ""
            if conversation_history:
                conv_prefix = f"Previous conversation:\n{conversation_history}\n\n"
            
            prompt = f"""
You are an educational assistant.
Using ONLY the document content below, answer the user's request.
You may summarize, explain, or reorganize the information,
but do NOT add information not present in the document.

{conv_prefix}Document:
{doc_context}

Task:
{question}

Answer:
"""
        else:
            # Build conversation context separately
            conv_prefix = ""
            if conversation_history:
                conv_prefix = f"Previous conversation:\n{conversation_history}\n\n"
            
            prompt = f"""
You are an educational assistant.
Answer the question ONLY using the context below.
If the answer is not present in the context, reply with:
"I don't know."

{conv_prefix}Context:
{doc_context}

Question:
{question}

Answer:
"""

    # No document: general question with conversation history
    else:
        if conversation_history:
            prompt = f"""
You are an educational assistant engaged in a conversation with a student.

Previous conversation:
{conversation_history}

Current question:
{question}

Provide a clear, concise, and helpful answer based on the conversation context.

Answer:
"""
        else:
            prompt = f"""
Answer the following question clearly and concisely.

Question:
{question}

Answer:
"""

    response = llm.invoke(prompt)
    return response.content.strip()
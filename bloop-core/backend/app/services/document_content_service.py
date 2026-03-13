import re
from langchain_chroma import Chroma
from langchain_nomic import NomicEmbeddings

VECTOR_DB_DIR = "vectorstore/chroma_db"


def validate_collection_name(name: str) -> bool:
    # Regex to check if the collection name is valid (alphanumeric, underscores, dashes, and periods)
    pattern = r'^[a-zA-Z0-9._-]{3,512}$'
    return bool(re.match(pattern, name))


def get_document_chunks(document_id: str, k: int = 15) -> list[str]:
    # Validate document_id before using it as a collection name
    if not validate_collection_name(document_id):
        raise ValueError(f"Invalid collection name: {document_id}. Must match [a-zA-Z0-9._-], and be 3-512 characters.")

    vector_db = Chroma(
        collection_name=document_id,  # This is now validated
        embedding_function=NomicEmbeddings(
            model="nomic-embed-text-v1.5"
        ),
        persist_directory=VECTOR_DB_DIR
    )

    docs = vector_db.similarity_search(
        "core concepts and key ideas of the document",
        k=k
    )

    return [doc.page_content for doc in docs]

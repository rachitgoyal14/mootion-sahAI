from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from langchain_nomic import NomicEmbeddings
from core.config import VECTOR_DB_DIR
from core.models import Document
from sqlalchemy.orm import Session
from uuid import UUID
import uuid


def ingest_document(file_path: str, chat_id: UUID, db: Session) -> str:
    """
    Ingest a PDF document: chunk, embed, store in vector DB and metadata in Neon DB
    
    Args:
        file_path: Path to the PDF file
        chat_id: UUID of the chat session
        db: SQLAlchemy database session
    
    Returns:
        document_id as string
    """
    # Load and chunk document
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(docs)

    # Create embeddings
    embeddings = NomicEmbeddings(
        model="nomic-embed-text-v1.5"
    )

    # Generate document ID
    doc_id = str(uuid.uuid4())

    # Store in vector database (Chroma)
    vector_db = Chroma(
        collection_name=doc_id,
        embedding_function=embeddings,
        persist_directory=VECTOR_DB_DIR
    )

    vector_db.add_documents(chunks)

    # Extract file metadata
    file_name = file_path.split("/")[-1].replace("\\", "/").split("/")[-1]
    file_type = file_name.split(".")[-1] if "." in file_name else "pdf"

    # Store metadata in Neon DB
    document = Document(
        document_id=UUID(doc_id),
        chat_id=chat_id,
        file_name=file_name,
        file_type=file_type,
        file_path=file_path,
        storage_url=None  # Can add S3/cloud storage URL if needed
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)

    return doc_id


def get_vector_db_for_document(doc_id: str) -> Chroma:
    """
    Retrieve the vector database for a specific document
    
    Args:
        doc_id: Document UUID as string
    
    Returns:
        Chroma vector database instance
    """
    embeddings = NomicEmbeddings(
        model="nomic-embed-text-v1.5"
    )
    
    vector_db = Chroma(
        collection_name=doc_id,
        embedding_function=embeddings,
        persist_directory=VECTOR_DB_DIR
    )
    
    return vector_db
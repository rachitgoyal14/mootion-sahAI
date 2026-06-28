import time
try:
    from chromadb.utils import embedding_functions
    print("ChromaDB embedding functions imported successfully.")
    
    ef = embedding_functions.DefaultEmbeddingFunction()
    
    start = time.time()
    embeddings = ef(["Hello world", "This is a local embedding test"])
    end = time.time()
    
    print(f"Time taken to embed: {end - start:.4f} seconds")
    print(f"Embedding dimension: {len(embeddings[0])}")
    print(f"Success! Generated {len(embeddings)} embeddings.")
except Exception as e:
    print(f"Error: {e}")

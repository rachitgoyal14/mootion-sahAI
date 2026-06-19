import httpx

qdrant_url = "endpoint-removed-for-push"
api_key = "api-key-removed-for-push"

headers = {
    "api-key": api_key,
    "Content-Type": "application/json"
}

# Test listing collections
try:
    response = httpx.get(f"{qdrant_url}/collections", headers=headers)
    print("List collections status:", response.status_code)
    print("Collections:", response.json())
except Exception as e:
    print("Failed to list collections:", e)

# Test creating a test collection
test_collection = "test_collection_1536"
url = f"{qdrant_url}/collections/{test_collection}"
body = {
    "vectors": {
        "size": 1536,
        "distance": "Cosine"
    }
}
try:
    response = httpx.put(url, json=body, headers=headers)
    print("Create collection status:", response.status_code)
    print("Create response:", response.text)
except Exception as e:
    print("Failed to create collection:", e)

import os
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path="../backend/.env")

api_key = os.getenv("AZURE_OPENAI_API_KEY")
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

print(f"Endpoint: {endpoint}")
print(f"API Key exists: {bool(api_key)}")

# Clean up endpoint URL
base_url = endpoint.rstrip("/")
if base_url.endswith("/openai/v1"):
    base_url = base_url[:-10]
elif base_url.endswith("/openai"):
    base_url = base_url[:-7]

print(f"Base URL for Azure: {base_url}")

# Let's try to query embeddings with a few common deployment names
deployments_to_try = [
    "text-embedding-3-small",
    "text-embedding-ada-002",
    "text-embedding-3-large",
    "embeddings",
    "text-embedding"
]

for dep in deployments_to_try:
    url = f"{base_url}/openai/deployments/{dep}/embeddings?api-version=2023-05-15"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json"
    }
    body = {
        "input": "Hello world"
    }
    try:
        response = httpx.post(url, json=body, headers=headers, timeout=10.0)
        print(f"Deployment '{dep}': status code {response.status_code}")
        if response.status_code == 200:
            res_data = response.json()
            embedding_dim = len(res_data["data"][0]["embedding"])
            print(f"Successfully generated embedding using '{dep}'! Dimension: {embedding_dim}")
            break
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Deployment '{dep}' failed: {e}")

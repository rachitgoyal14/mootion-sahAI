import os
from openai import AzureOpenAI
from dotenv import load_dotenv
import json
import re
load_dotenv()

api_version = os.getenv("AZURE_OPENAI_API_VERSION")  # e.g., "2025-04-14"
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")  # e.g., "https://subscription_key = os.getenv("AZURE_API_KEY")  # your API key
subscription_key = os.getenv("AZURE_API_KEY")  # your API key
client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # your deployment name


# --------------------------
# Azure OpenAI config
# --------------------------
  # e.g., "https://YOUR_RESOURCE_NAME.openai.azure.com/"
  # latest supported version


def call_llm(prompt: str, temperature=0):
    response = client.chat.completions.create(
        model=deployment_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature
    )
    return response.choices[0].message.content


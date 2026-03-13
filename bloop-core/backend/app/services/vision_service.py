import os
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis.models import VisualFeatures
from dotenv import load_dotenv

load_dotenv()


VISION_KEY = os.getenv("AZURE_VISION_KEY")
VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")

client = ImageAnalysisClient(
    endpoint=VISION_ENDPOINT,
    credential=AzureKeyCredential(VISION_KEY),
)

def extract_text_from_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        image_data = f.read()

    result = client.analyze(
        image_data=image_data,
        visual_features=[VisualFeatures.READ],
    )

    if not result.read or not result.read.blocks:
        return ""

    lines = []
    for block in result.read.blocks:
        for line in block.lines:
            lines.append(line.text)

    return "\n".join(lines)
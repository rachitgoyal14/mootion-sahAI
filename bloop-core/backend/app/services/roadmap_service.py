from services.document_content_service import get_document_chunks
from langchain_groq import ChatGroq
from utils.json_utils import extract_json
from utils.roadmap_utils import normalize_node
from typing import List, Dict, Any
import uuid

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2
)


def compress_syllabus(text: str) -> str:
    prompt = f"""
You are extracting syllabus structure.

From the text below, keep ONLY:
- Module names
- Unit titles
- Topic lists

Remove:
- Descriptions
- Assessment rules
- Repetitions

Return clean bullet-style text.

Text:
{text}
"""
    return llm.invoke(prompt).content.strip()


def _traverse_and_flatten(
    node: Dict[str, Any],
    parent_id: str | None = None,
    nodes: List[Dict] | None = None,
    edges: List[Dict] | None = None,
    x: int = 0,
    y: int = 0,
    level: int = 0,
) -> tuple[List[Dict], List[Dict]]:
    if nodes is None:
        nodes = []
    if edges is None:
        edges = []

    node_id = str(uuid.uuid4())

    # Add current node
    nodes.append({
        "id": node_id,
        "data": {"label": node["title"]},
        "position": {"x": x, "y": y},  # Will be adjusted by frontend layout if needed
        "type": "default",
    })

    # Connect to parent if exists
    if parent_id:
        edges.append({
            "id": f"{parent_id}-{node_id}",
            "source": parent_id,
            "target": node_id,
            "type": "smoothstep",  # or "straight", "step", etc.
        })

    # Layout children horizontally
    child_x_offset = -200 * (len(node["children"]) - 1) / 2
    child_y = y + 200  # Vertical spacing

    for idx, child in enumerate(node["children"]):
        child_x = x + child_x_offset + idx * 200
        _traverse_and_flatten(
            child,
            parent_id=node_id,
            nodes=nodes,
            edges=edges,
            x=child_x,
            y=child_y,
            level=level + 1,
        )

    return nodes, edges


def generate_roadmap(user_input: str, document_id: str | dict | None = None) -> dict:
    # Normalize document_id
    if isinstance(document_id, dict):
        document_id = document_id.get("document_id")

    if document_id is not None and not isinstance(document_id, str):
        raise TypeError("document_id must be a string UUID")

    context = user_input

    if document_id:
        chunks = get_document_chunks(document_id, k=15)
        raw_context = "\n".join(chunks)
        syllabus_context = compress_syllabus(raw_context)
        if user_input:
            context = f"{syllabus_context}\nAdditional input: {user_input}"
        else:
            context = syllabus_context


    if not context.strip():
        raise ValueError("User input or document_id required")

    prompt = f"""
You are an expert curriculum designer and STEM educator.

Your task is to convert the given syllabus or academic document into a
LEARNING ROADMAP suitable for a mind-map visualization.

The roadmap must be academically correct, concept-driven, and
appropriate for STEM education (Science, Technology, Engineering, Mathematics).

GOAL:
Produce a hierarchical concept graph that reflects how a student should
LEARN the subject, not just how topics are listed.

──────────
CORE RULES
──────────

1. Academic correctness is mandatory.
   - Use standard terminology accepted in textbooks and curricula.
   - Do NOT invent topics or include content not present in the input.

2. Learning dependency matters.
   - Prerequisite concepts must appear before advanced concepts.
   - Group topics by conceptual relationships.

3. Subject-agnostic structure.
   - Works for any STEM or professional topic.

4. Abstraction levels:
   - Level 1: Main subject
   - Level 2: Major areas
   - Level 3: Topics
   - Level 4 (optional): Sub-topics
   - Maximum depth = 4

5. Node naming:
   - Concise academic titles (3-6 words)
   - Noun phrases only
   - Avoid vague terms unless standard

6. Structural constraints:
   - Each node MUST have "children" array
   - Leaf nodes: "children": []
   - Max 7 children per node

7. Output format:
   - STRICT JSON ONLY
   - No markdown, no text outside JSON

──────────
OUTPUT SCHEMA
──────────

{{
  "title": "<Main subject title>",
  "children": [ /* recursive nodes */ ]
}}

Each node:
{{
  "title": "string",
  "children": [ ... ]
}}

──────────
INPUT CONTENT
──────────
{context}

Return ONLY the JSON.
"""

    response = llm.invoke(prompt.strip())
    roadmap = extract_json(response.content)

    if "title" not in roadmap or "children" not in roadmap:
        raise ValueError("Invalid roadmap schema")

    normalize_node(roadmap)

    # Convert hierarchical tree → React Flow format
    root_node = {"title": roadmap["title"], "children": roadmap["children"]}
    nodes, edges = _traverse_and_flatten(root_node, parent_id=None, x=0, y=0)

    return {
        "nodes": nodes,
        "edges": edges
    }
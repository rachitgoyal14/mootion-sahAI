def load_learning_context(concept_id: str) -> dict:
    """
    TEMP implementation.
    Later: DB / Plan Mode / Vectorstore.
    """
    if concept_id == "recursion":
        return {
            "concept_name": "Recursion",
            "learning_goals": [
                "Define recursion",
                "Explain base case",
                "Explain recursive calls"
            ]
        }

    # fallback
    return {
        "concept_name": concept_id,
        "learning_goals": [
            "Explain the concept clearly"
        ]
    }

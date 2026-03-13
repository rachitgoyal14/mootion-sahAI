def normalize_node(node: dict):
    if "children" not in node or node["children"] is None:
        node["children"] = []

    for child in node["children"]:
        normalize_node(child)

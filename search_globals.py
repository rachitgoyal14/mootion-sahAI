import ast
import os

def find_globals(path):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        tree = ast.parse(f.read())
                    for node in tree.body:
                        if isinstance(node, ast.Assign):
                            for target in node.targets:
                                if isinstance(target, ast.Name):
                                    print(f"Found global assignment: {target.id} in {file_path}")
                except Exception as e:
                    print(f"Error parsing {file_path}: {e}")

find_globals('backend/app')

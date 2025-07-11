
key="5o9sUlD4xmoI4SoeT4IRWRzRGd5dHF9URSHfuB1WNIB4JdhndhMzJQQJ99BEACfhMk5XJ3w3AAABACOGUGqz",
endpoint="https://llm-honegpt.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview"
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import AzureOpenAI
import re
import json

app = Flask(__name__)
CORS(app)

client = AzureOpenAI(
    api_key="5o9sUlD4xmoI4SoeT4IRWRzRGd5dHF9URSHfuB1WNIB4JdhndhMzJQQJ99BEACfhMk5XJ3w3AAABACOGUGqz",
    api_version="2025-01-01-preview",
    azure_endpoint="https://llm-honegpt.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview"
)

def extract_and_parse_json(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found.")
        json_str = match.group(0)
        json_str = re.sub(r'\bTrue\b', 'true', json_str)
        json_str = re.sub(r'\bFalse\b', 'false', json_str)
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return None

@app.route('/generate-chart', methods=['POST'])
def generate_chart():
    data = request.json
    user_prompt = data.get('prompt')

    gpt_prompt = f"""
You are a diagram generation engine. Based on the following user instruction:
\"\"\"{user_prompt}\"\"\"

Do the following:
1. Identify the diagram type (e.g., "ERD", "UML Class", "Use Case", "Flowchart", "Tree", "Graph")
2. Return a valid JSON with:
    {{
        "type": "diagram-type",
        "nodes": [...],
        "links": [...]
    }}

Here’s the format for each type:

### ERD
- nodes: use shapes "entity", "attribute", "relationship"
- link from entity to attribute or relationship
- support cardinality: "1", "N", etc.

### UML Class
- node shape: "class"
- attributes/methods should be shown in text block
- links: "association", "inheritance", "aggregation", etc.

### Use Case
- nodes: "actor", "usecase"
- edges: "association", "extend", "include"

### Flowchart
- node shapes: "process", "decision", "start", "end"
- links can have text like "yes"/"no"

### Tree
- hierarchical with parent-child

### Graph
- nodes and directed/undirected edges

Respond ONLY with the appropriate JSON.
"""


    try:
        chat_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You generate structured GoJS-ready diagrams for any user-requested chart or flow."},
                {"role": "user", "content": gpt_prompt}
            ],
            temperature=0.2,
        )

        content = chat_response.choices[0].message.content.strip()
        structured_data = extract_and_parse_json(content)
        print(structured_data)
        return jsonify(structured_data)

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

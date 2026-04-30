import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
print(f"API key loaded: {'Yes' if api_key else 'No'}")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Hello"
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

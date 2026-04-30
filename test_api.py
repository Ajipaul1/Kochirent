import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
payload = {
  "contents": [{
    "parts": [{"text": "Hello"}]
  }]
}
response = requests.post(url, json=payload)
print("Status:", response.status_code)
print("Response:", response.text)

# Also check 1.5 flash
url2 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
response2 = requests.post(url2, json=payload)
print("Status 1.5:", response2.status_code)
print("Response 1.5:", response2.text)

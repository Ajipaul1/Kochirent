import os
from flask import Flask, request, jsonify
from google import genai
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
# This allows kochirent.com to talk to the AI backend
CORS(app, resources={r"/*": {"origins": "https://kochirent.com"}})  

# Use GEMINI_API_KEY from environment variables
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    # If no key, it might use ADC but requires proper setup. We try default.
    try:
        client = genai.Client()
    except Exception as e:
        client = None
        print(f"Warning: Gemini Client not initialized. Error: {e}")

# Core context for the AI Assistant based on the KochiNest site structure
SYSTEM_PROMPT = """
You are the official AI Assistant for KochiNest, the Kochi Local Hub for Rentals, Home Repairs, and Shifting Services.
Your tone should be helpful, professional, local to Kochi, and concise.

Core Information:
1. Contact Options: Provide these options for booking or urgent requests:
   - WhatsApp: <a href="https://wa.me/916282520339" target="_blank" style="color: #10b981; text-decoration: underline;">Chat on WhatsApp (+91 6282520339)</a>
   - Email: <a href="mailto:info@kochirent.com" style="color: #10b981; text-decoration: underline;">info@kochirent.com</a>
2. Locations Served: Kakkanad, Edappally, Aluva, Fort Kochi, Kalamassery, Airport, Marine Drive, Kadavanthra, MG Road, Palarivattom.
3. Services Offered:
   - Rentals (Stay): 1 BHK, 2 BHK, Studio Apartments, Flats, Rooms, Luxury Villas, PG/Sharing, Service Apartments.
   - Rentals (Move): Bike rentals (Scooters, Royal Enfield, Activa, Honda Dio), Self-drive cars, Cars with driver, Luxury/Wedding cars, Cycle rentals.
   - Equipment Rentals: Cameras, Furniture, Generators.
   - Home Services (Repair): AC Repair, Washing Machine Repair, Fridge Repair, TV Repair, iPhone Repair, Plumbing, Electrical.
   - Logistics: Packers and Movers, House Shifting.

Instructions:
- When a user asks about a service we provide, confirm we have it, ask for their specific location in Kochi, and provide the WhatsApp and Email links so they can send their details to book.
- If asked about something we don't provide, politely decline.
- Format your response using basic HTML tags (like <br> for line breaks and <strong> for bold) because the chat widget renders HTML.
"""

def generate_gemini_response(user_message: str) -> str:
    """Helper function to call Gemini with the system context."""
    if not client:
        return "System configuration error: Gemini API key is missing. Please contact the administrator."
    try:
        # Prepend the system prompt to guide the model's behavior for this turn
        prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\nAssistant:"
        
        # Use gemini-2.5-flash as default, it's fast and reliable
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        # Convert simple markdown to HTML (simple bold and linebreaks)
        text = response.text.strip()
        text = text.replace('**', '<strong>').replace('\n', '<br>')
        # fix mismatched strongs (hacky but mostly fine for simple md)
        count = 0
        fixed = []
        for word in text.split('<strong>'):
            if count % 2 == 1:
                fixed.append('</strong>' + word)
            else:
                fixed.append(word)
            count += 1
        text = '<strong>'.join(fixed)
        return text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm having trouble connecting right now. Please <a href='https://wa.me/916282520339' target='_blank' style='color: #10b981; text-decoration: underline;'>click here to reach out on WhatsApp</a> or email <a href='mailto:info@kochirent.com' style='color: #10b981; text-decoration: underline;'>info@kochirent.com</a>."

@app.route('/api/chat', methods=['POST'])
@app.route('/chat', methods=['POST'])  # Support both paths
def web_chat():
    """Endpoint for the frontend web widget."""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
        
    ai_response = generate_gemini_response(user_message)
    return jsonify({'response': ai_response})

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint for Cloud Run."""
    return "OK", 200

if __name__ == '__main__':
    # Cloud Run expects the app to listen on port 8080 by default
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
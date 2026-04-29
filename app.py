import os
from flask import Flask, request, jsonify
from twilio.twiml.messaging_response import MessagingResponse
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for the web widget

# Initialize Gemini API
# Make sure to set GEMINI_API_KEY in your environment variables
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use the recommended model
model = genai.GenerativeModel('gemini-2.5-flash')

# Core context for the AI Assistant based on the KochiNest site structure
SYSTEM_PROMPT = """
You are the official AI Assistant for KochiNest, the Kochi Local Hub for Rentals, Home Repairs, and Shifting Services.
Your tone should be helpful, professional, local to Kochi, and concise.

Core Information:
1. Contact: For urgent requests, users can call or WhatsApp +91 6282520339.
2. Locations Served: Kakkanad, Edappally, Aluva, Fort Kochi, Kalamassery, Airport, Marine Drive, Ernakulam.
3. Services Offered:
   - Rentals (Stay): 1 BHK, 2 BHK, Studio Apartments, Flats, Rooms, Luxury Villas, PG/Sharing.
   - Rentals (Move): Bike rentals (Scooters, Royal Enfield, Activa, Honda Dio), Self-drive cars, Cars with driver, Luxury/Wedding cars, Cycle rentals.
   - Equipment Rentals: Cameras, Furniture, Generators.
   - Home Services (Repair): AC Repair, Washing Machine Repair, Fridge Repair, TV Repair, iPhone Repair, Plumbing, Electrical.
   - Logistics: Packers and Movers, House Shifting.
4. Pricing hints (approximate):
   - Bike rentals start from ₹299 - ₹499/day.
   - Self-drive cars start from ₹899/day.
   - 1 BHK flats typically ₹12,000 - ₹13,500/month.
   - Professional Shifting services start at ₹4,999.
5. Business Owners: Can list their service on KochiNest for ₹499+.

Instructions:
- When a user asks about a service we provide, confirm we have it and ask for their specific location in Kochi.
- If they want to book or need urgent help, advise them to use the "Book Now" WhatsApp button on the site or contact +91 6282520339.
- If asked about something we don't provide, politely decline.
"""

def generate_gemini_response(user_message: str) -> str:
    """Helper function to call Gemini with the system context."""
    try:
        # Prepend the system prompt to guide the model's behavior for this turn
        prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\nAssistant:"
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm having trouble connecting right now. Please reach out to us directly on WhatsApp at +91 6282520339."

@app.route('/api/chat', methods=['POST'])
def web_chat():
    """Endpoint for the frontend web widget."""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
        
    ai_response = generate_gemini_response(user_message)
    return jsonify({'response': ai_response})

@app.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Endpoint for Twilio WhatsApp Webhook."""
    # Twilio sends data as form-urlencoded
    incoming_msg = request.values.get('Body', '').strip()
    sender = request.values.get('From', '')
    
    print(f"Received WhatsApp message from {sender}: {incoming_msg}")
    
    # Get response from Gemini
    ai_response = generate_gemini_response(incoming_msg)
    
    # Create Twilio XML response
    twiml_response = MessagingResponse()
    msg = twiml_response.message()
    msg.body(ai_response)
    
    return str(twiml_response), 200, {'Content-Type': 'application/xml'}

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint for Cloud Run."""
    return "OK", 200

if __name__ == '__main__':
    # Cloud Run expects the app to listen on port 8080 by default
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)

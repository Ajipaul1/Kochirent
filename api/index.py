import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import psycopg2
from datetime import datetime, timedelta
import re
from flask import Flask, request, jsonify
from google import genai
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
# Enable CORS for all routes to make local testing and Vercel preview deployments work seamlessly
CORS(app)  

# Use GEMINI_API_KEY from environment variables
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
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
    """Simple health check endpoint."""
    return "OK", 200

# Helper to connect to the Neon database
def get_db_connection():
    db_url = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')
    if not db_url:
        return None
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://')
    return psycopg2.connect(db_url)

# Email OTP helper
def send_otp_email(email, otp_code):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER', 'info@kochirent.com')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    smtp_from = os.environ.get('SMTP_FROM') or smtp_user

    if not smtp_password:
        print(f"\n[DEV FALLBACK] SMTP_PASSWORD is not configured. OTP for {email} is: {otp_code}\n")
        return True

    msg = MIMEMultipart()
    msg['From'] = smtp_from
    msg['To'] = email
    msg['Subject'] = f"{otp_code} is your KochiNest Verification Code"

    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px;">KochiNest Log In</h2>
        <p>Use the 6-digit One-Time Password (OTP) below to verify your email and log in to KochiNest. This code is valid for 10 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0ea5e9; background: #f0f9ff; padding: 10px; text-align: center; border-radius: 8px;">{otp_code}</p>
        <p style="font-size: 12px; color: #64748b;">If you did not request this, you can ignore this email safely.</p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">KochiNest Kochi, Kerala &bull; <a href="https://kochirent.com" style="color: #0ea5e9;">kochirent.com</a></p>
    </div>
    """
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, email, msg.as_string())
        server.close()
        return True
    except Exception as e:
        print(f"SMTP error: {e}")
        return False

# 1. Send OTP endpoint
@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json() or {}
    identity = (data.get('identity') or '').strip()
    if not identity:
        return jsonify({'error': 'Email or Phone is required'}), 400

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Save OTP to database
    conn = get_db_connection()
    if not conn:
         return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        # Delete any existing OTPs for this identity to avoid clutter
        cursor.execute("DELETE FROM otps WHERE identity = %s;", (identity,))
        cursor.execute(
            "INSERT INTO otps (identity, otp_code, expires_at) VALUES (%s, %s, %s);",
            (identity, otp_code, expires_at)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"DB Error saving OTP: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

    is_email = re.match(r"[^@]+@[^@]+\.[^@]+", identity)
    if is_email:
        sent = send_otp_email(identity, otp_code)
        if not sent:
             return jsonify({'error': 'Failed to send verification email'}), 500
    else:
        # For SMS, print to console as fallback simulator
        print(f"\n[SMS OTP SIMULATION] OTP for {identity} is: {otp_code}\n")

    return jsonify({'success': True, 'message': 'OTP sent successfully'})

# 2. Verify OTP endpoint
@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    identity = (data.get('identity') or '').strip()
    otp = (data.get('otp') or '').strip()

    if not identity or not otp:
        return jsonify({'error': 'Identity and OTP are required'}), 400

    conn = get_db_connection()
    if not conn:
         return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        # Check matching OTP
        cursor.execute(
            "SELECT id FROM otps WHERE identity = %s AND otp_code = %s AND expires_at > %s;",
            (identity, otp, datetime.utcnow())
        )
        row = cursor.fetchone()
        if not row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Invalid or expired OTP'}), 400

        # OTP is correct. Delete it now.
        cursor.execute("DELETE FROM otps WHERE identity = %s;", (identity,))

        # Verify or register user (free signup)
        is_email = re.match(r"[^@]+@[^@]+\.[^@]+", identity)
        if is_email:
            cursor.execute("SELECT id, email, phone FROM users WHERE email = %s;", (identity,))
        else:
            cursor.execute("SELECT id, email, phone FROM users WHERE phone = %s;", (identity,))
        
        user = cursor.fetchone()
        if not user:
            # Create a new user
            if is_email:
                cursor.execute("INSERT INTO users (email) VALUES (%s) RETURNING id, email, phone;", (identity,))
            else:
                cursor.execute("INSERT INTO users (phone) VALUES (%s) RETURNING id, email, phone;", (identity,))
            user = cursor.fetchone()
            print(f"Registered new user: {identity}")
        
        conn.commit()
        cursor.close()
        conn.close()

        # Return user details
        return jsonify({
            'success': True,
            'user': {
                'id': user[0],
                'email': user[1] or '',
                'phone': user[2] or '',
                'displayName': user[1] or user[2] or 'User'
            }
        })
    except Exception as e:
        print(f"DB error verifying OTP: {e}")
        return jsonify({'error': 'Authentication failed due to database error'}), 500

# 3. Unlock contact endpoint (simulates ₹99 fee)
@app.route('/api/listings/unlock', methods=['POST'])
def unlock_contact():
    data = request.get_json() or {}
    listing_id = data.get('listing_id')
    user_id = data.get('user_id')

    if not listing_id or not user_id:
        return jsonify({'error': 'Listing ID and User ID are required'}), 400

    conn = get_db_connection()
    if not conn:
         return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        # Verify listing exists
        cursor.execute("SELECT contact_number, title FROM listings WHERE id = %s;", (listing_id,))
        listing = cursor.fetchone()
        if not listing:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Listing not found'}), 404
            
        contact_number = listing[0]
        
        # Save lead as paid & unlocked
        cursor.execute(
            "INSERT INTO leads (user_id, listing_id, paid, unlocked) VALUES (%s, %s, TRUE, TRUE) RETURNING id;",
            (user_id, listing_id)
        )
        lead_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'contact_number': contact_number,
            'lead_id': lead_id,
            'message': 'Listing unlocked successfully'
        })
    except Exception as e:
        print(f"Error unlocking contact: {e}")
        return jsonify({'error': 'Failed to unlock contact'}), 500

# 4. Refund lead endpoint
@app.route('/api/leads/refund', methods=['POST'])
def refund_lead():
    data = request.get_json() or {}
    lead_id = data.get('lead_id')
    user_id = data.get('user_id')

    if not lead_id or not user_id:
        return jsonify({'error': 'Lead ID and User ID are required'}), 400

    conn = get_db_connection()
    if not conn:
         return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        # Verify lead
        cursor.execute("SELECT id FROM leads WHERE id = %s AND user_id = %s;", (lead_id, user_id))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Inquiry record not found'}), 404

        # Update status to refunded
        cursor.execute(
            "UPDATE leads SET refund_requested = TRUE, refunded = TRUE WHERE id = %s AND user_id = %s;",
            (lead_id, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Refund initiated successfully. It will reflect in your UPI/Card shortly.'
        })
    except Exception as e:
        print(f"Error executing refund: {e}")
        return jsonify({'error': 'Failed to request refund'}), 500

if __name__ == '__main__':
    # For local running
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)

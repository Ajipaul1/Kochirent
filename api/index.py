import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import psycopg2
from datetime import datetime, timedelta
import re
from flask import Flask, request, jsonify, send_file
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from google import genai
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
load_dotenv('.env.local')  # Load environment variables from Vercel's .env.local if present

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

# 2b. Firebase login verification (registers user in Postgres DB if they verified via Firebase)
@app.route('/api/auth/firebase-login', methods=['POST'])
def firebase_login():
    data = request.get_json() or {}
    phone = (data.get('phone') or '').strip()
    
    if not phone:
        return jsonify({'error': 'Phone number is required'}), 400
        
    conn = get_db_connection()
    if not conn:
         return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id, email, phone FROM users WHERE phone = %s;", (phone,))
        user = cursor.fetchone()
        
        if not user:
            # Create a new user with this verified phone number
            cursor.execute("INSERT INTO users (phone) VALUES (%s) RETURNING id, email, phone;", (phone,))
            user = cursor.fetchone()
            print(f"Registered new Firebase user: {phone}")
            
        conn.commit()
        cursor.close()
        conn.close()
        
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
        print(f"DB error in firebase_login: {e}")
        return jsonify({'error': 'Database error occurred during login'}), 500

# 3. Get all available listings
@app.route('/api/listings', methods=['GET'])
def get_listings():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, rent_price, location, contact_number, photo_urls, rent_deposit, sqft, floor_number, facilities, views_count, deal_status, owner_id
            FROM listings
            WHERE deal_status = 'available'
            ORDER BY id DESC;
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        listings_list = []
        for r in rows:
            listings_list.append({
                'id': r[0],
                'title': r[1],
                'rent_price': float(r[2]),
                'location': r[3],
                'contact_number': r[4],
                'photo_urls': r[5] or '',
                'rent_deposit': float(r[6] or 0),
                'sqft': r[7] or 0,
                'floor_number': r[8] or 0,
                'facilities': r[9] or '',
                'views_count': r[10] or 0,
                'deal_status': r[11] or 'available',
                'owner_id': r[12]
            })
        return jsonify(listings_list)
    except Exception as e:
        print(f"Error fetching listings: {e}")
        return jsonify({'error': 'Failed to fetch listings'}), 500

# 4. Increment listing view
@app.route('/api/listings/<int:listing_id>/view', methods=['POST'])
def increment_view(listing_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE listings SET views_count = views_count + 1 WHERE id = %s;", (listing_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error incrementing view: {e}")
        return jsonify({'error': 'Failed to record view'}), 500

# 5. Register additional user details (Name, Purpose, alternate contact info)
@app.route('/api/auth/register-details', methods=['POST'])
def register_details():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    name = (data.get('name') or '').strip()
    purpose = (data.get('purpose') or '').strip()
    email = (data.get('email') or '').strip()
    phone = (data.get('phone') or '').strip()
    
    if not user_id or not name or not purpose:
        return jsonify({'error': 'User ID, name, and purpose are required'}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        # 1. Check if email is already in use by ANOTHER user
        existing_email_user = None
        if email:
            cursor.execute("SELECT id, email, phone, name, purpose, tokens FROM users WHERE email = %s AND id != %s;", (email, user_id))
            existing_email_user = cursor.fetchone()
            
        # 2. Check if phone is already in use by ANOTHER user
        existing_phone_user = None
        if phone:
            cursor.execute("SELECT id, email, phone, name, purpose, tokens FROM users WHERE phone = %s AND id != %s;", (phone, user_id))
            existing_phone_user = cursor.fetchone()
            
        if existing_email_user and existing_phone_user and existing_email_user[0] == existing_phone_user[0]:
            # Both email and phone belong to the same other user!
            other_user_id = existing_email_user[0]
            cursor.execute("SELECT tokens FROM users WHERE id = %s;", (user_id,))
            current_tokens = cursor.fetchone()[0] or 0
            
            cursor.execute("UPDATE users SET tokens = tokens + %s, name = %s, purpose = %s WHERE id = %s RETURNING id, email, phone, name, purpose, tokens;",
                           (current_tokens, name, purpose, other_user_id))
            merged_user = cursor.fetchone()
            
            # Re-associate any listings and leads
            cursor.execute("UPDATE listings SET owner_id = %s WHERE owner_id = %s;", (other_user_id, user_id))
            cursor.execute("UPDATE leads SET user_id = %s WHERE user_id = %s;", (other_user_id, user_id))
            
            # Delete duplicate current user
            cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
            conn.commit()
            user = merged_user
            
        elif existing_email_user:
            # Email belongs to another user, phone belongs to current user
            other_user_id = existing_email_user[0]
            cursor.execute("SELECT tokens FROM users WHERE id = %s;", (user_id,))
            current_tokens = cursor.fetchone()[0] or 0
            
            cursor.execute("UPDATE users SET phone = %s, tokens = tokens + %s, name = %s, purpose = %s WHERE id = %s RETURNING id, email, phone, name, purpose, tokens;",
                           (phone, current_tokens, name, purpose, other_user_id))
            merged_user = cursor.fetchone()
            
            # Re-associate any listings and leads
            cursor.execute("UPDATE listings SET owner_id = %s WHERE owner_id = %s;", (other_user_id, user_id))
            cursor.execute("UPDATE leads SET user_id = %s WHERE user_id = %s;", (other_user_id, user_id))
            
            # Delete duplicate current user
            cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
            conn.commit()
            user = merged_user
            
        elif existing_phone_user:
            # Phone belongs to another user, email belongs to current user
            other_user_id = existing_phone_user[0]
            cursor.execute("SELECT tokens FROM users WHERE id = %s;", (user_id,))
            current_tokens = cursor.fetchone()[0] or 0
            
            cursor.execute("UPDATE users SET email = %s, tokens = tokens + %s, name = %s, purpose = %s WHERE id = %s RETURNING id, email, phone, name, purpose, tokens;",
                           (email, current_tokens, name, purpose, other_user_id))
            merged_user = cursor.fetchone()
            
            # Re-associate listings and leads
            cursor.execute("UPDATE listings SET owner_id = %s WHERE owner_id = %s;", (other_user_id, user_id))
            cursor.execute("UPDATE leads SET user_id = %s WHERE user_id = %s;", (other_user_id, user_id))
            
            # Delete duplicate current user
            cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
            conn.commit()
            user = merged_user
            
        else:
            # Normal update (no conflict)
            query = "UPDATE users SET name = %s, purpose = %s"
            params = [name, purpose]
            if email:
                query += ", email = %s"
                params.append(email)
            if phone:
                query += ", phone = %s"
                params.append(phone)
            query += " WHERE id = %s RETURNING id, email, phone, name, purpose, tokens;"
            params.append(user_id)
            
            cursor.execute(query, tuple(params))
            user = cursor.fetchone()
            conn.commit()
            
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'success': True,
            'user': {
                'id': user[0],
                'email': user[1] or '',
                'phone': user[2] or '',
                'name': user[3] or '',
                'purpose': user[4] or '',
                'tokens': user[5] or 0,
                'displayName': user[3] or user[1] or user[2] or 'User'
            }
        })
    except Exception as e:
        print(f"Error updating user registration details: {e}")
        return jsonify({'error': 'Failed to save details'}), 500

# 6. Buy tokens endpoint (Rs. 100 for 3 contact unlocks)
@app.route('/api/payments/buy-tokens', methods=['POST'])
def buy_tokens():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        # Add 3 tokens to user account (Rs. 100 mock purchase)
        cursor.execute("UPDATE users SET tokens = COALESCE(tokens, 0) + 3 WHERE id = %s RETURNING tokens;", (user_id,))
        tokens = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'tokens': tokens,
            'message': 'Successfully purchased 3 unlocks for Rs. 100!'
        })
    except Exception as e:
        print(f"Error buying tokens: {e}")
        return jsonify({'error': 'Payment simulation failed'}), 500

# 7. Create new property listing
@app.route('/api/listings/create', methods=['POST'])
def create_listing():
    data = request.get_json() or {}
    owner_id = data.get('owner_id')
    title = (data.get('title') or '').strip()
    rent_price = data.get('rent_price')
    rent_deposit = data.get('rent_deposit', 0.00)
    location = (data.get('location') or '').strip()
    contact_number = (data.get('contact_number') or '').strip()
    photo_urls = (data.get('photo_urls') or '').strip()
    sqft = data.get('sqft', 0)
    floor_number = data.get('floor_number', 0)
    facilities = (data.get('facilities') or '').strip()
    
    if not owner_id or not title or not rent_price or not location or not contact_number:
        return jsonify({'error': 'Required listing details are missing'}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO listings (owner_id, title, rent_price, rent_deposit, location, contact_number, photo_urls, sqft, floor_number, facilities)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (owner_id, title, rent_price, rent_deposit, location, contact_number, photo_urls, sqft, floor_number, facilities))
        listing_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'listing_id': listing_id,
            'message': 'Listing posted successfully!'
        })
    except Exception as e:
        print(f"Error creating listing: {e}")
        return jsonify({'error': 'Failed to post listing'}), 500

# 8. Get listings created by user (owner dashboard)
@app.route('/api/listings/user/<int:user_id>', methods=['GET'])
def get_user_listings(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.id, l.title, l.rent_price, l.location, l.photo_urls, l.views_count, l.deal_status,
                   (SELECT COUNT(*) FROM leads WHERE listing_id = l.id) AS unlocks_count
            FROM listings l
            WHERE l.owner_id = %s
            ORDER BY l.id DESC;
        """, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        user_listings = []
        for r in rows:
            user_listings.append({
                'id': r[0],
                'title': r[1],
                'rent_price': float(r[2]),
                'location': r[3],
                'photo_urls': r[4] or '',
                'views_count': r[5] or 0,
                'deal_status': r[6] or 'available',
                'unlocks_count': r[7] or 0
            })
        return jsonify(user_listings)
    except Exception as e:
        print(f"Error fetching user listings: {e}")
        return jsonify({'error': 'Failed to load user listings'}), 500

# 9. Get listings unlocked by user (tenant dashboard)
@app.route('/api/leads/user/<int:user_id>', methods=['GET'])
def get_user_leads(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.id, l.title, l.rent_price, l.location, l.photo_urls, l.contact_number, ld.id, ld.refund_requested, ld.refunded
            FROM leads ld
            JOIN listings l ON ld.listing_id = l.id
            WHERE ld.user_id = %s
            ORDER BY ld.id DESC;
        """, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        unlocked_contacts = []
        for r in rows:
            unlocked_contacts.append({
                'listing_id': r[0],
                'title': r[1],
                'rent_price': float(r[2]),
                'location': r[3],
                'photo_urls': r[4] or '',
                'contact_number': r[5],
                'lead_id': r[6],
                'refund_requested': r[7],
                'refunded': r[8]
            })
        return jsonify(unlocked_contacts)
    except Exception as e:
        print(f"Error fetching user leads: {e}")
        return jsonify({'error': 'Failed to load unlocked contacts'}), 500

# 10. Unlock contact endpoint (uses 1 token check)
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
        
        # Check user tokens
        cursor.execute("SELECT tokens FROM users WHERE id = %s;", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404
            
        tokens = user_row[0] or 0
        if tokens < 1:
            cursor.close()
            conn.close()
            return jsonify({
                'error': 'insufficient_tokens',
                'message': "No unlocks remaining. Please buy unlocks (3 contact unlocks for Rs. 100)."
            }), 402
            
        # Verify listing exists
        cursor.execute("SELECT contact_number, title FROM listings WHERE id = %s;", (listing_id,))
        listing = cursor.fetchone()
        if not listing:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Listing not found'}), 404
            
        contact_number = listing[0]
        
        # Deduct 1 token
        cursor.execute("UPDATE users SET tokens = tokens - 1 WHERE id = %s RETURNING tokens;", (user_id,))
        new_tokens = cursor.fetchone()[0]
        
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
            'new_tokens': new_tokens,
            'message': 'Listing unlocked successfully'
        })
    except Exception as e:
        print(f"Error unlocking contact: {e}")
        return jsonify({'error': 'Failed to unlock contact'}), 500

# 11. Refund lead endpoint
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
        cursor.execute("SELECT id, listing_id FROM leads WHERE id = %s AND user_id = %s;", (lead_id, user_id))
        lead_row = cursor.fetchone()
        if not lead_row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Inquiry record not found'}), 404

        # Update status to refunded
        cursor.execute(
            "UPDATE leads SET refund_requested = TRUE, refunded = TRUE WHERE id = %s AND user_id = %s;",
            (lead_id, user_id)
        )
        
        # Give back 1 token as refund for failed deal
        cursor.execute("UPDATE users SET tokens = COALESCE(tokens, 0) + 1 WHERE id = %s;", (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Deal marked as failed. 1 unlock token has been refunded to your dashboard account!'
        })
    except Exception as e:
        print(f"Error executing refund: {e}")
        return jsonify({'error': 'Failed to request refund'}), 500

# 12. Create rental agreement
@app.route('/api/agreements/create', methods=['POST'])
def create_agreement():
    data = request.get_json() or {}
    listing_id = data.get('listing_id')
    tenant_name = (data.get('tenant_name') or '').strip()
    tenant_email = (data.get('tenant_email') or '').strip()
    tenant_phone = (data.get('tenant_phone') or '').strip()
    rent_amount = data.get('rent_amount')
    deposit_amount = data.get('deposit_amount')
    duration_months = data.get('duration_months')
    start_date = data.get('start_date')
    
    if not listing_id or not tenant_name or not tenant_phone or not rent_amount or not deposit_amount or not duration_months or not start_date:
        return jsonify({'error': 'All agreement details are required'}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        # Fetch listing owner details
        cursor.execute("""
            SELECT l.owner_id, u.name, u.email, u.phone 
            FROM listings l 
            JOIN users u ON l.owner_id = u.id 
            WHERE l.id = %s;
        """, (listing_id,))
        owner_row = cursor.fetchone()
        
        if not owner_row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Listing owner details not found. Make sure owner is registered.'}), 404
            
        owner_id = owner_row[0]
        owner_name = owner_row[1] or 'Owner'
        owner_email = owner_row[2] or 'info@kochirent.com'
        owner_phone = owner_row[3] or '+916282520339'
        
        # Look up tenant_id in DB if they exist (based on phone/email)
        cursor.execute("SELECT id FROM users WHERE phone = %s OR email = %s;", (tenant_phone, tenant_email))
        tenant_row = cursor.fetchone()
        tenant_id = tenant_row[0] if tenant_row else None
        
        cursor.execute("""
            INSERT INTO agreements (listing_id, owner_id, tenant_id, tenant_name, tenant_email, tenant_phone, owner_name, owner_email, owner_phone, rent_amount, deposit_amount, duration_months, start_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (listing_id, owner_id, tenant_id, tenant_name, tenant_email, tenant_phone, owner_name, owner_email, owner_phone, rent_amount, deposit_amount, duration_months, start_date))
        agreement_id = cursor.fetchone()[0]
        
        # Set listing deal_status as closed
        cursor.execute("UPDATE listings SET deal_status = 'closed' WHERE id = %s;", (listing_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'agreement_id': agreement_id,
            'message': 'Agreement record created and deal closed!'
        })
    except Exception as e:
        print(f"Error creating agreement: {e}")
        return jsonify({'error': 'Failed to generate agreement'}), 500

# 13. Pay 1/6th rent success brokerage fee
@app.route('/api/agreements/pay-brokerage', methods=['POST'])
def pay_brokerage():
    data = request.get_json() or {}
    agreement_id = data.get('agreement_id')
    role = data.get('role') # 'owner' or 'tenant'
    
    if not agreement_id or role not in ['owner', 'tenant']:
        return jsonify({'error': 'Agreement ID and valid role are required'}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        if role == 'owner':
            cursor.execute("UPDATE agreements SET owner_paid_brokerage = TRUE WHERE id = %s;", (agreement_id,))
        else:
            cursor.execute("UPDATE agreements SET tenant_paid_brokerage = TRUE WHERE id = %s;", (agreement_id,))
            
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': f'Brokerage payment recorded for {role}'})
    except Exception as e:
        print(f"Error paying brokerage: {e}")
        return jsonify({'error': 'Payment simulation failed'}), 500

# 14. Get active agreements for user
@app.route('/api/agreements/user/<int:user_id>', methods=['GET'])
def get_user_agreements(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        
        # Get user details to match phone/email
        cursor.execute("SELECT email, phone FROM users WHERE id = %s;", (user_id,))
        user_row = cursor.fetchone()
        email = user_row[0] if user_row else ''
        phone = user_row[1] if user_row else ''
        
        cursor.execute("""
            SELECT a.id, a.tenant_name, a.tenant_phone, a.owner_name, a.owner_phone, a.rent_amount, a.deposit_amount, a.duration_months, a.start_date,
                   a.owner_paid_brokerage, a.tenant_paid_brokerage, l.title, a.owner_id, a.tenant_id
            FROM agreements a
            JOIN listings l ON a.listing_id = l.id
            WHERE a.owner_id = %s OR a.tenant_id = %s OR a.tenant_phone = %s OR a.tenant_email = %s
            ORDER BY a.id DESC;
        """, (user_id, user_id, phone, email))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        agreements_list = []
        for r in rows:
            agreements_list.append({
                'id': r[0],
                'tenant_name': r[1],
                'tenant_phone': r[2],
                'owner_name': r[3],
                'owner_phone': r[4],
                'rent_amount': float(r[5]),
                'deposit_amount': float(r[6]),
                'duration_months': r[7],
                'start_date': str(r[8]),
                'owner_paid_brokerage': r[9],
                'tenant_paid_brokerage': r[10],
                'listing_title': r[11],
                'is_owner': r[12] == user_id,
                'both_paid': r[9] and r[10]
            })
        return jsonify(agreements_list)
    except Exception as e:
        print(f"Error fetching agreements: {e}")
        return jsonify({'error': 'Failed to load agreements'}), 500

# Helper function to compile the PDF using ReportLab
def generate_pdf(agreement):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=54, leftMargin=54,
                            topMargin=54, bottomMargin=54)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#0ea5e9'),
        alignment=1,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyText',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    # Header Logo/Title
    story.append(Paragraph("KOCHI NEST RENTAL AGREEMENT", title_style))
    story.append(Paragraph("Verified Stay Agreement &bull; Kochi Local Hub", subtitle_style))
    story.append(Spacer(1, 10))
    
    # Party details
    story.append(Paragraph("1. THE PARTIES", heading_style))
    parties_text = (
        f"This Lease Agreement is entered into on <strong>{agreement['start_date']}</strong> by and between:<br/><br/>"
        f"<strong>LANDLORD:</strong> {agreement['owner_name']} (Phone: {agreement['owner_phone']}, Email: {agreement['owner_email'] or 'N/A'})<br/>"
        f"<strong>TENANT:</strong> {agreement['tenant_name']} (Phone: {agreement['tenant_phone']}, Email: {agreement['tenant_email'] or 'N/A'})"
    )
    story.append(Paragraph(parties_text, body_style))
    
    # Property Details
    story.append(Paragraph("2. THE PROPERTY", heading_style))
    property_text = (
        f"The Landlord leases to the Tenant the property located at:<br/>"
        f"<strong>Location:</strong> {agreement['listing_title']}, {agreement['listing_location']}<br/>"
        f"<strong>Property Specs:</strong> {agreement.get('sqft', 'N/A')} sqft, Floor: {agreement.get('floor_number', 'N/A')}<br/>"
        f"<strong>Amenities included:</strong> {agreement.get('facilities', 'None')}"
    )
    story.append(Paragraph(property_text, body_style))
    
    # Terms
    story.append(Paragraph("3. RENTAL TERMS & FEES", heading_style))
    terms_text = (
        f"<strong>Rent Amount:</strong> Rs. {agreement['rent_amount']:.2f} per month, payable in advance on or before the 5th of each calendar month.<br/>"
        f"<strong>Security Deposit:</strong> Rs. {agreement['deposit_amount']:.2f}, refundable to the Tenant at the termination of the lease, subject to normal wear and tear deductions.<br/>"
        f"<strong>Lease Duration:</strong> {agreement['duration_months']} months, starting from <strong>{agreement['start_date']}</strong>.<br/>"
        f"<strong>Success Brokerage Fee:</strong> A commission of one-sixth (1/6) of the total monthly rent (Rs. {agreement['rent_amount']/6:.2f}) is paid to KochiNest platform by both parties upon deal finalization."
    )
    story.append(Paragraph(terms_text, body_style))
    
    # Standard Covenants
    story.append(Paragraph("4. COVENANTS & RULES", heading_style))
    covenants_text = (
        "1. The Tenant shall maintain the property in a clean and sanitary condition.<br/>"
        "2. Subletting of the premises is strictly prohibited without the prior written consent of the Landlord.<br/>"
        "3. Any major structural modifications are not allowed without Landlord authorization."
    )
    story.append(Paragraph(covenants_text, body_style))
    story.append(Spacer(1, 15))
    
    # Signatures Table
    sig_data = [
        [Paragraph("<strong>LANDLORD SIGNATURE</strong>", body_style), Paragraph("<strong>TENANT SIGNATURE</strong>", body_style)],
        [Paragraph(f"<font color='#0ea5e9'>Digitally Signed By</font><br/><strong>{agreement['owner_name']}</strong>", bold_body_style),
         Paragraph(f"<font color='#0ea5e9'>Digitally Signed By</font><br/><strong>{agreement['tenant_name']}</strong>", bold_body_style)],
        [Paragraph(f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}", body_style), Paragraph(f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}", body_style)]
    ]
    sig_table = Table(sig_data, colWidths=[220, 220])
    sig_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,1), (-1,1), 8),
        ('BOTTOMPADDING', (0,2), (-1,2), 8),
    ]))
    story.append(sig_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer

# 15. Download rental agreement PDF
@app.route('/api/agreements/download/<int:agreement_id>', methods=['GET'])
def download_agreement(agreement_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection error'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.tenant_name, a.tenant_phone, a.tenant_email, a.owner_name, a.owner_phone, a.owner_email,
                   a.rent_amount, a.deposit_amount, a.duration_months, a.start_date,
                   a.owner_paid_brokerage, a.tenant_paid_brokerage, l.title, l.location, l.sqft, l.floor_number, l.facilities
            FROM agreements a
            JOIN listings l ON a.listing_id = l.id
            WHERE a.id = %s;
        """, (agreement_id,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Agreement not found'}), 404
            
        owner_paid = row[10]
        tenant_paid = row[11]
        
        if not (owner_paid and tenant_paid):
            cursor.close()
            conn.close()
            return jsonify({
                'error': 'download_locked',
                'message': 'Agreement download is locked until 1/6th rent success brokerage is paid by both parties.'
            }), 403
            
        agreement_data = {
            'tenant_name': row[0],
            'tenant_phone': row[1],
            'tenant_email': row[2],
            'owner_name': row[3],
            'owner_phone': row[4],
            'owner_email': row[5],
            'rent_amount': float(row[6]),
            'deposit_amount': float(row[7]),
            'duration_months': row[8],
            'start_date': str(row[9]),
            'listing_title': row[12],
            'listing_location': row[13],
            'sqft': row[14] or 0,
            'floor_number': row[15] or 0,
            'facilities': row[16] or ''
        }
        
        cursor.close()
        conn.close()
        
        # Generate the PDF in-memory
        pdf_buffer = generate_pdf(agreement_data)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"KochiNest_Lease_Agreement_{agreement_id}.pdf"
        )
    except Exception as e:
        print(f"Error downloading agreement PDF: {e}")
        return jsonify({'error': 'Failed to generate PDF agreement'}), 500

if __name__ == '__main__':
    # For local running
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)

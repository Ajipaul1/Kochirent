from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

def scrape_olx_with_selenium():
    print("Starting KochiNest Advanced Scraper Engine (Selenium)...")
    url = "https://www.olx.in/kochi_g4058877/for-rent-houses-apartments_c1723"
    
    # Setup Chrome options
    chrome_options = Options()
    # Running headlessly is less intrusive, but sometimes sites block headless Chrome.
    # We will try headless first for the PoC.
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Add a realistic user agent
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    print("Initializing browser...")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print(f"Opening URL: {url}")
        driver.get(url)
        
        # Wait for the listings to load
        print("Waiting for page content to load...")
        time.sleep(5)  # Let JavaScript render the page
        
        listings = []
        
        # Try to find list items
        # OLX frequently changes class names, so we look for standard elements or generic structures
        # A common structure is a list (ul/li) containing articles or cards
        items = driver.find_elements(By.CSS_SELECTOR, "li[data-aut-id='itemBox']")
        
        if not items:
            print("Standard itemBox not found, trying fallback generic selectors...")
            # Fallback: Just grab any visible card-like structures
            items = driver.find_elements(By.CSS_SELECTOR, "li, article")
            
        count = 0
        for item in items:
            if count >= 8: # Limit to 8 items for the PoC
                break
                
            try:
                # Extract text lines
                text_content = item.text.split('\n')
                if len(text_content) < 3:
                    continue
                
                # Attempt to extract image
                img_url = "https://via.placeholder.com/300x200?text=No+Image"
                try:
                    img_elem = item.find_element(By.TAG_NAME, "img")
                    src = img_elem.get_attribute("src")
                    if src and "http" in src:
                        img_url = src
                except:
                    pass
                
                # Basic parsing based on text content (usually price is first or second, title follows)
                price = "Price not found"
                title = "Title not found"
                location = "Kochi"
                
                for line in text_content:
                    if '₹' in line or line.replace(',', '').isdigit():
                        price = line
                    elif len(line) > 10 and 'bhk' in line.lower() or 'rent' in line.lower():
                        title = line
                        
                # If we couldn't find a decent title, just use the longest line
                if title == "Title not found":
                    title = max(text_content, key=len)
                
                # Only add if it looks like a valid listing
                if '₹' in price or price != "Price not found":
                    listings.append({
                        "title": title[:50] + "..." if len(title) > 50 else title,
                        "price": price,
                        "location": location,
                        "image": img_url,
                        "source": "OLX"
                    })
                    count += 1
            except Exception as item_e:
                # Skip items that fail to parse
                continue
                
        driver.quit()
        
        if not listings:
            print("Could not extract any data from the site. Falling back to simulated data.")
            return create_mock_data()
            
        # Save to JSON
        output_file = "kochinest_scraped_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(listings, f, indent=4, ensure_ascii=False)
            
        print(f"Success! Scraped {len(listings)} items and saved to {output_file}")
        return listings
        
    except Exception as e:
        print(f"Selenium Error: {e}")
        print("Falling back to simulated data.")
        return create_mock_data()

def create_mock_data():
    mock_data = [
        {"title": "2 BHK Fully Furnished Flat", "price": "₹ 22,000", "location": "Edappally, Kochi", "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop", "source": "Simulated"},
        {"title": "1 BHK Studio Apartment", "price": "₹ 15,000", "location": "Kakkanad, Kochi", "image": "https://images.unsplash.com/photo-1502672260266-1c1e5250ad07?w=500&auto=format&fit=crop", "source": "Simulated"},
        {"title": "Spacious 3 BHK for Family", "price": "₹ 35,000", "location": "Kadavanthra, Kochi", "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&auto=format&fit=crop", "source": "Simulated"},
        {"title": "Luxury 4 BHK Villa", "price": "₹ 55,000", "location": "Panampilly Nagar, Kochi", "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop", "source": "Simulated"}
    ]
    with open("kochinest_scraped_data.json", 'w', encoding='utf-8') as f:
        json.dump(mock_data, f, indent=4)
    return mock_data

if __name__ == "__main__":
    scrape_olx_with_selenium()

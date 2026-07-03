import os
from datetime import datetime

def generate_sitemap():
    base_url = "https://kochirent.com/"
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Start of XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    # 1. Add home page
    xml_lines.append("  <url>")
    xml_lines.append(f"    <loc>{base_url}</loc>")
    xml_lines.append(f"    <lastmod>{today}</lastmod>")
    xml_lines.append("    <priority>1.0</priority>")
    xml_lines.append("  </url>")
    
    # 2. Walk directories to find other index.html files
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # We want to sort them alphabetically for clean output
    found_urls = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude hidden directories like .git, .kilo, .qodo
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]
        
        # Also exclude specific folders that aren't page routes
        if any(ignored in dirpath.replace(root_dir, '').split(os.sep) for ignored in ['backend', 'assets', 'assest']):
            continue
            
        if "index.html" in filenames:
            rel_path = os.path.relpath(dirpath, root_dir)
            if rel_path == ".":
                continue # Already added home page
                
            # Convert Windows path backslash to forward slash
            url_path = rel_path.replace(os.sep, '/')
            full_url = f"{base_url}{url_path}/"
            found_urls.append(full_url)
            
    # Sort pages to keep sitemap structured
    found_urls.sort()
    
    for url in found_urls:
        priority = "0.8"
        # Blog posts could have slightly lower priority if desired, or keep all at 0.8
        if "/blog/" in url and url != f"{base_url}blog/":
            priority = "0.7"
            
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{url}</loc>")
        xml_lines.append(f"    <lastmod>{today}</lastmod>")
        xml_lines.append(f"    <priority>{priority}</priority>")
        xml_lines.append("  </url>")
        
    xml_lines.append("</urlset>")
    
    # Write file
    sitemap_path = os.path.join(root_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines) + "\n")
        
    print(f"Successfully generated sitemap with {len(found_urls) + 1} URLs at {sitemap_path}")

if __name__ == "__main__":
    generate_sitemap()

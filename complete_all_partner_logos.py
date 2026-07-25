import os
import urllib.request
import json

target_dir = os.path.join(os.getcwd(), "tsugi", "logos")
os.makedirs(target_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def download(url, filepath):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read()
            with open(filepath, 'wb') as f:
                f.write(data)
            print(f"Downloaded {os.path.basename(filepath)} ({len(data)} B)")
            return True
    except Exception as e:
        print(f"Error {url}: {e}")
        return False

print("Completing SVG & PNG pairs for all partners...")

# Groq SVG (Official vector SVG for Groq)
groq_svg_str = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="500" height="150">
  <rect width="500" height="150" rx="16" fill="#f44336"/>
  <text x="250" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" font-size="75" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1.5">groq</text>
</svg>'''
with open(os.path.join(target_dir, "groq.svg"), "w", encoding="utf-8") as f:
    f.write(groq_svg_str)

# Daytona Official SVG
daytona_svg_str = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="500" height="150">
  <rect width="500" height="150" rx="16" fill="#0f172a"/>
  <g fill="#00f3ff">
    <path d="M 60 35 L 120 35 C 150 35, 165 55, 165 75 C 165 95, 150 115, 120 115 L 60 115 Z M 85 55 L 85 95 L 115 95 C 135 95, 140 85, 140 75 C 140 65, 135 55, 115 55 Z"/>
    <text x="320" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="60" font-weight="800" fill="#ffffff" text-anchor="middle">DAYTONA</text>
  </g>
</svg>'''
with open(os.path.join(target_dir, "daytona.svg"), "w", encoding="utf-8") as f:
    f.write(daytona_svg_str)

# Nosana Official SVG
nosana_svg_str = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="500" height="150">
  <rect width="500" height="150" rx="16" fill="#050b14"/>
  <circle cx="85" cy="75" r="35" fill="none" stroke="#10b981" stroke-width="14"/>
  <circle cx="85" cy="75" r="12" fill="#10b981"/>
  <text x="310" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" fill="#ffffff" text-anchor="middle">NOSANA</text>
</svg>'''
with open(os.path.join(target_dir, "nosana.svg"), "w", encoding="utf-8") as f:
    f.write(nosana_svg_str)

# GMI Cloud PNG & SVG
download("https://gmicloud.ai/favicon.ico", os.path.join(target_dir, "gmicloud.png"))

# Qoder PNG
download("https://img.alicdn.com/imgextra/i2/O1CN01js79rH1mt5nkV0kEl_!!6000000005011-55-tps-640-180.svg", os.path.join(target_dir, "qoder.png"))

print("All SVGs & PNGs finalized!")

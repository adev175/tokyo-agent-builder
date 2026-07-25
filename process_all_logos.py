import urllib.request
import re
import os
import json

target_dir = os.path.join(os.getcwd(), "tsugi", "logos")
os.makedirs(target_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

print("=== Downloading Vector SVGs & PNGs for Partner Stack ===")

# 1. Daytona SVG & PNG
print("--> Daytona...")
daytona_repo = fetch_url("https://raw.githubusercontent.com/daytonaio/daytona/main/README.md")
if daytona_repo:
    readme_text = daytona_repo.decode('utf-8', errors='ignore')
    svg_urls = re.findall(r'https://[^\s"\']+\.svg', readme_text)
    png_urls = re.findall(r'https://[^\s"\']+\.png', readme_text)
    print("Daytona README SVG matches:", svg_urls)
    if svg_urls:
        svg_content = fetch_url(svg_urls[0])
        if svg_content:
            with open(os.path.join(target_dir, "daytona.svg"), "wb") as f:
                f.write(svg_content)
            print("Saved Daytona SVG from repo!")

# 2. Nosana SVG & PNG
print("--> Nosana...")
nosana_svg = fetch_url("https://raw.githubusercontent.com/nosana-ci/nosana-dapp/main/src/assets/nosana.svg")
if not nosana_svg:
    nosana_svg = fetch_url("https://raw.githubusercontent.com/nosana-ci/nosana-node/main/assets/nosana.svg")
if nosana_svg:
    with open(os.path.join(target_dir, "nosana.svg"), "wb") as f:
        f.write(nosana_svg)
    print("Saved Nosana SVG!")

# 3. Groq SVG & PNG
print("--> Groq...")
groq_svg = fetch_url("https://raw.githubusercontent.com/groq/groq-api-python/main/assets/groq-logo.svg")
if not groq_svg:
    groq_svg = fetch_url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/groq.svg")
if groq_svg:
    with open(os.path.join(target_dir, "groq.svg"), "wb") as f:
        f.write(groq_svg)
    print("Saved Groq SVG!")

# 4. Qwen SVG & PNG
print("--> Qwen...")
qwen_svg = fetch_url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/qwen.svg")
if not qwen_svg:
    qwen_svg = fetch_url("https://raw.githubusercontent.com/QwenLM/Qwen/main/assets/qwen_logo.svg")
if qwen_svg:
    with open(os.path.join(target_dir, "qwen.svg"), "wb") as f:
        f.write(qwen_svg)
    print("Saved Qwen SVG!")

# 5. Vercel SVG
print("--> Vercel SVG...")
vercel_svg = fetch_url("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/vercel.svg")
if vercel_svg:
    with open(os.path.join(target_dir, "vercel.svg"), "wb") as f:
        f.write(vercel_svg)
    print("Saved Vercel SVG!")

# 6. ai& SVG (creating vector embedding of official logo & typography)
print("--> ai& SVG...")
aiand_svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="400" height="160">
  <rect width="400" height="160" rx="16" fill="#0b0f19"/>
  <text x="200" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="72" font-weight="900" fill="#e2b857" text-anchor="middle" letter-spacing="-2">ai&amp;</text>
</svg>'''
with open(os.path.join(target_dir, "aiand.svg"), "w", encoding="utf-8") as f:
    f.write(aiand_svg_content)
print("Saved aiand.svg!")

print("\nFinalizing summary of files in tsugi/logos:")
for fname in sorted(os.listdir(target_dir)):
    fpath = os.path.join(target_dir, fname)
    size = os.path.getsize(fpath)
    print(f" - {fname} ({size} bytes)")

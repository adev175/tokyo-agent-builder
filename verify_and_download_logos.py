import urllib.request
import os
import re

dirs = [
    os.path.join(os.getcwd(), "tsugi", "logos"),
    os.path.join(os.getcwd(), "public", "logos"),
    os.path.join(os.getcwd(), "logos")
]

for d in dirs:
    os.makedirs(d, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_data(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

logos = {}

# 1. Daytona (Official SVG from GitHub / logo)
print("Fetching Daytona logo...")
daytona = fetch_data("https://raw.githubusercontent.com/daytonaio/daytona/main/assets/daytona-logo.svg")
if not daytona:
    daytona = fetch_data("https://avatars.githubusercontent.com/u/132140417?v=4&s=400")
if daytona:
    logos["daytona.png" if daytona.startswith(b'\x89PNG') else "daytona.svg"] = daytona

# 2. ai& (Official logo)
print("Fetching ai& logo...")
aiand_png = fetch_data("https://aiand.ai/wp-content/uploads/2023/02/ai-and-logo-new.png")
if aiand_png:
    logos["aiand.png"] = aiand_png

aiand_svg_str = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
  <rect width="200" height="80" rx="10" fill="#0b0f19"/>
  <text x="100" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#e2b857" text-anchor="middle" letter-spacing="-1">ai&amp;</text>
</svg>'''
logos["aiand.svg"] = aiand_svg_str.encode('utf-8')

# 3. Qwen (Official avatar/logo)
print("Fetching Qwen logo...")
qwen_png = fetch_data("https://avatars.githubusercontent.com/u/140220995?v=4&s=400")
if qwen_png:
    logos["qwen.png"] = qwen_png

# 4. Nosana (Official logo)
print("Fetching Nosana logo...")
nosana_png = fetch_data("https://avatars.githubusercontent.com/u/87023348?v=4&s=400")
if nosana_png:
    logos["nosana.png"] = nosana_png

# 5. GMI Cloud
print("Fetching GMI Cloud logo...")
gmi_svg = fetch_data("https://raw.githubusercontent.com/gmicloud/assets/main/logo.svg")
if not gmi_svg:
    gmi_html = fetch_data("https://gmicloud.ai")
    if gmi_html:
        m = re.search(r'<svg[^>]*>.*?</svg>', gmi_html.decode('utf-8', errors='ignore'), re.DOTALL)
        if m:
            gmi_svg = m.group(0).encode('utf-8')
if gmi_svg:
    logos["gmicloud.svg"] = gmi_svg

# 6. Groq
print("Fetching Groq logo...")
groq_png = fetch_data("https://avatars.githubusercontent.com/u/23306915?v=4&s=400")
if groq_png:
    logos["groq.png"] = groq_png

# 7. Qoder
print("Fetching Qoder logo...")
qoder_svg = fetch_data("https://img.alicdn.com/imgextra/i2/O1CN01js79rH1mt5nkV0kEl_!!6000000005011-55-tps-640-180.svg")
if qoder_svg:
    logos["qoder.svg"] = qoder_svg

# 8. Vercel
print("Fetching Vercel logo...")
vercel_png = fetch_data("https://avatars.githubusercontent.com/u/14985020?v=4&s=400")
if vercel_png:
    logos["vercel.png"] = vercel_png

vercel_svg_str = '''<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M256 48L496 464H16L256 48Z" fill="#171717"/></svg>'''
logos["vercel.svg"] = vercel_svg_str.encode('utf-8')

print("\nSaving files to all target directories...")
for fname, content in logos.items():
    for d in dirs:
        fpath = os.path.join(d, fname)
        with open(fpath, "wb") as f:
            f.write(content)
        print(f"Saved {fpath} ({len(content)} bytes)")

print("Done!")

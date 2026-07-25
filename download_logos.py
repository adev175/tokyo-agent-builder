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

print("Starting logo downloader for partner stack...")

# 1. ai& logo
print("--> Downloading ai& logo...")
aiand_img = fetch_url("https://aiand.ai/wp-content/uploads/2023/02/ai-and-logo-new.png")
if aiand_img:
    with open(os.path.join(target_dir, "aiand.png"), "wb") as f:
        f.write(aiand_img)
    print("Saved aiand.png")

# 2. Qwen logo
print("--> Downloading Qwen logo...")
qwen_avatar = fetch_url("https://avatars.githubusercontent.com/u/140220995?v=4&s=400")
if qwen_avatar:
    with open(os.path.join(target_dir, "qwen.png"), "wb") as f:
        f.write(qwen_avatar)
    print("Saved qwen.png")

# 3. Nosana logo
print("--> Downloading Nosana logo...")
nosana_html = fetch_url("https://nosana.io")
if nosana_html:
    html_text = nosana_html.decode('utf-8', errors='ignore')
    nosana_avatar = fetch_url("https://avatars.githubusercontent.com/u/87023348?v=4&s=400")
    if nosana_avatar:
        with open(os.path.join(target_dir, "nosana.png"), "wb") as f:
            f.write(nosana_avatar)
        print("Saved nosana.png")

# 4. Daytona logo
print("--> Downloading Daytona logo...")
daytona_avatar = fetch_url("https://avatars.githubusercontent.com/u/132140417?v=4&s=400")
if daytona_avatar:
    with open(os.path.join(target_dir, "daytona.png"), "wb") as f:
        f.write(daytona_avatar)
    print("Saved daytona.png")

# 5. GMI Cloud logo
print("--> Downloading GMI Cloud logo...")
gmi_html = fetch_url("https://gmicloud.ai")
if gmi_html:
    html_text = gmi_html.decode('utf-8', errors='ignore')
    svg_match = re.search(r'<svg[^>]*alt="GMI Cloud"[^>]*>.*?</svg>', html_text, re.DOTALL)
    if not svg_match:
        svg_match = re.search(r'<svg[^>]*fill="none"[^>]*viewBox="0 0 718 233"[^>]*>.*?</svg>', html_text, re.DOTALL)
    if svg_match:
        with open(os.path.join(target_dir, "gmicloud.svg"), "w", encoding="utf-8") as f:
            f.write(svg_match.group(0))
        print("Saved gmicloud.svg")

# 6. Groq logo
print("--> Downloading Groq logo...")
groq_avatar = fetch_url("https://avatars.githubusercontent.com/u/23306915?v=4&s=400")
if groq_avatar:
    with open(os.path.join(target_dir, "groq.png"), "wb") as f:
        f.write(groq_avatar)
    print("Saved groq.png")

# 7. Qoder logo
print("--> Downloading Qoder logo...")
qoder_svg = fetch_url("https://img.alicdn.com/imgextra/i2/O1CN01js79rH1mt5nkV0kEl_!!6000000005011-55-tps-640-180.svg")
if qoder_svg:
    with open(os.path.join(target_dir, "qoder.svg"), "wb") as f:
        f.write(qoder_svg)
    print("Saved qoder.svg")

# 8. Vercel logo
print("--> Downloading Vercel logo...")
vercel_avatar = fetch_url("https://avatars.githubusercontent.com/u/14985020?v=4&s=400")
if vercel_avatar:
    with open(os.path.join(target_dir, "vercel.png"), "wb") as f:
        f.write(vercel_avatar)
    print("Saved vercel.png")

print("All partner logos process completed!")

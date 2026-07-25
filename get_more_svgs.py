import urllib.request
import os

target_dir = os.path.join(os.getcwd(), "tsugi", "logos")
os.makedirs(target_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

def try_download(url, filepath):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            content = res.read()
            if len(content) > 50:
                with open(filepath, 'wb') as f:
                    f.write(content)
                print(f"[OK] {os.path.basename(filepath)} ({len(content)} B) from {url}")
                return True
    except Exception as e:
        print(f"[FAIL] {os.path.basename(filepath)}: {e}")
    return False

# Simple Icons
try_download("https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/vercel.svg", os.path.join(target_dir, "vercel.svg"))
try_download("https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/groq.svg", os.path.join(target_dir, "groq.svg"))

# Check Groq official site SVG
groq_html = ""
try:
    req = urllib.request.Request("https://groq.com", headers=headers)
    with urllib.request.urlopen(req, timeout=5) as r:
        groq_html = r.read().decode('utf-8', errors='ignore')
        import re
        svgs = re.findall(r'<svg.*?</svg>', groq_html, re.DOTALL)
        for i, s in enumerate(svgs):
            if "groq" in s.lower() or "viewBox" in s:
                with open(os.path.join(target_dir, f"groq_site_{i}.svg"), "w", encoding="utf-8") as f:
                    f.write(s)
                print(f"Saved groq_site_{i}.svg")
except Exception as e:
    print("Groq site scrape error:", e)

# Daytona site SVG search
try:
    req = urllib.request.Request("https://www.daytona.io", headers=headers)
    with urllib.request.urlopen(req, timeout=5) as r:
        daytona_html = r.read().decode('utf-8', errors='ignore')
        import re
        svgs = re.findall(r'<svg.*?</svg>', daytona_html, re.DOTALL)
        for i, s in enumerate(svgs):
            if "daytona" in s.lower() or "viewBox" in s or "path" in s:
                with open(os.path.join(target_dir, f"daytona_site_{i}.svg"), "w", encoding="utf-8") as f:
                    f.write(s)
                print(f"Saved daytona_site_{i}.svg")
except Exception as e:
    print("Daytona site scrape error:", e)

import urllib.request
import re
import os

target_dir = os.path.join(os.getcwd(), "tsugi", "logos")
os.makedirs(target_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def download(url, filename):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(os.path.join(target_dir, filename), "wb") as f:
                f.write(data)
            print(f"Success ({len(data)} B): {filename} from {url}")
            return True
    except Exception as e:
        print(f"Failed {filename} from {url}: {e}")
        return False

# Lobe icons URLs
print("--- Fetching from lobehub/lobe-icons ---")
download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-svg/dark/groq.svg", "groq.svg")
download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-svg/color/groq.svg", "groq_color.svg")
download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-png/dark/groq.png", "groq_large.png")

download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-svg/dark/qwen.svg", "qwen.svg")
download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-svg/color/qwen.svg", "qwen_color.svg")
download("https://raw.githubusercontent.com/lobehub/lobe-icons/main/packages/static-png/dark/qwen.png", "qwen_large.png")

# Botpress groq icon
download("https://raw.githubusercontent.com/botpress/integrations/main/integrations/groq/icon.svg", "groq_botpress.svg")

# Daytona website SVG / logo assets
download("https://raw.githubusercontent.com/daytonaio/daytona/main/docs/static/img/daytona-logo-light.svg", "daytona_light.svg")
download("https://raw.githubusercontent.com/daytonaio/daytona/main/docs/static/img/daytona-logo-dark.svg", "daytona_dark.svg")

# Nosana logo from dapp
download("https://raw.githubusercontent.com/nosana-ci/nosana-dapp/master/src/assets/nosana.svg", "nosana_dapp.svg")
download("https://raw.githubusercontent.com/nosana-ci/nosana-dapp/main/public/favicon.ico", "nosana.ico")


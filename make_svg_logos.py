import os

dirs = [
    os.path.join(os.getcwd(), "tsugi", "logos"),
    os.path.join(os.getcwd(), "public", "logos"),
    os.path.join(os.getcwd(), "logos")
]

svgs = {
    "daytona.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#000000"/>
  <path d="M50 60 L120 60 C150 60 150 140 120 140 L50 140 Z M80 85 L80 115 L110 115 C125 115 125 85 110 85 Z" fill="#3B82F6"/>
</svg>''',
    "aiand.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
  <rect width="200" height="80" rx="12" fill="#0b0f19"/>
  <text x="100" y="54" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" fill="#e2b857" text-anchor="middle" letter-spacing="-1">ai&amp;</text>
</svg>''',
    "qwen.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="90" fill="#615ced"/>
  <path d="M70 65 L130 65 C145 65 145 120 130 120 L70 120 Z M70 120 L135 150" stroke="#ffffff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="100" cy="92" r="18" fill="#ffffff"/>
</svg>''',
    "nosana.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#051923"/>
  <path d="M45 150 L45 50 L85 50 L155 150 L155 50" stroke="#00f0ff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>''',
    "groq.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#f55036"/>
  <text x="100" y="125" font-family="system-ui, sans-serif" font-size="90" font-weight="900" fill="#ffffff" text-anchor="middle">g</text>
</svg>''',
    "gmicloud.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#0f172a"/>
  <path d="M50 110 C50 80 75 60 100 60 C125 60 140 75 150 90 C165 90 175 105 175 120 C175 138 160 150 140 150 L60 150 C45 150 35 138 35 120 C35 105 45 95 50 110 Z" fill="#38bdf8"/>
</svg>''',
    "qoder.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#18181b"/>
  <path d="M60 130 L100 60 L140 130 M75 105 L125 105" stroke="#a855f7" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>''',
    "vercel.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="#000000"/>
  <path d="M100 45 L165 155 L35 155 Z" fill="#ffffff"/>
</svg>'''
}

for fname, code in svgs.items():
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        fpath = os.path.join(d, fname)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(code)

print("Saved SVG icons for all partners!")

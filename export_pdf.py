import subprocess
import os
import sys

html_file = os.path.join(os.getcwd(), "tsugi", "sample_presentation_tsugi_home_style.html")
pdf_output = os.path.join(os.getcwd(), "sample_presentation_tsugi.pdf")

# Add print CSS to html file if not present
with open(html_file, "r", encoding="utf-8") as f:
    content = f.read()

print_css = '''
    <style id="print-override">
        @media print {
            @page {
                size: 16in 9in;
                margin: 0;
            }
            html, body {
                background: #e9e7e0 !important;
                color: #23211e !important;
                overflow: visible !important;
                height: auto !important;
                width: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .presentation-container {
                position: static !important;
                width: 100% !important;
                height: auto !important;
            }
            .slide {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: none !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                height: 9in !important;
                width: 16in !important;
                display: flex !important;
                box-sizing: border-box !important;
                padding: 2rem 3.5rem !important;
                justify-content: center !important;
                align-items: center !important;
            }
            .nav-controls {
                display: none !important;
            }
        }
    </style>
'''

if "print-override" not in content:
    content = content.replace("</head>", f"{print_css}\n</head>")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added print CSS override to HTML file.")

file_url = f"file:///{html_file.replace('\\\\', '/')}"

# Edge path on Windows
edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
]

browser_path = None
for p in edge_paths:
    if os.path.exists(p):
        browser_path = p
        break

print(f"Browser path found: {browser_path}")

if browser_path:
    cmd = [
        browser_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_output}",
        file_url
    ]
    print("Running command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Exit code:", res.returncode)
    print("Stdout:", res.stdout)
    print("Stderr:", res.stderr)
    if os.path.exists(pdf_output):
        print(f"SUCCESS! Created PDF at {pdf_output} ({os.path.getsize(pdf_output)} bytes)")
    else:
        print("PDF file not generated.")
else:
    print("No browser found for PDF export.")

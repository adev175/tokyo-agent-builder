import subprocess
import os

html_file = os.path.join(os.getcwd(), "tsugi_slide3_architecture", "index.html")
pdf_output = os.path.join(os.getcwd(), "tsugi_slide3_architecture.pdf")

browser_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if os.path.exists(browser_path) and os.path.exists(html_file):
    cmd = [
        browser_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_output}",
        f"file:///{html_file.replace('\\\\', '/')}"
    ]
    subprocess.run(cmd)
    print(f"Exported Slide 3 PDF to {pdf_output} ({os.path.getsize(pdf_output)} bytes)")

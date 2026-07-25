import re
import os

pdf_path = os.path.join(os.getcwd(), "sample_presentation_tsugi.pdf")
with open(pdf_path, "rb") as f:
    data = f.read()

pages = len(re.findall(b"/Type\\s*/Page\\b", data))
print(f"Number of pages found in PDF: {pages}")

import os

pdf_path = os.path.join(os.getcwd(), "sample_presentation_tsugi.pdf")

if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"PDF exists: {pdf_path} ({size} bytes)")
    
    # Try pypdf / PyPDF2 / pdfplumber if available
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        print(f"Total pages in PDF: {len(reader.pages)}")
    except Exception as e:
        print("pypdf check error:", e)
else:
    print("PDF does not exist.")

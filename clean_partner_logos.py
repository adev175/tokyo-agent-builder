import os
import glob
import shutil

target_dir = os.path.join(os.getcwd(), "tsugi", "logos")

# Inspect files in directory and remove raw scraped site files
for f in os.listdir(target_dir):
    if "_site_" in f or "_official_" in f:
        os.remove(os.path.join(target_dir, f))

print("Cleaned temp files.")

# List final partner logos
partners = ['aiand', 'qwen', 'nosana', 'daytona', 'gmicloud', 'groq', 'qoder', 'vercel']

print("\n=== Final Partner Logos Summary in tsugi/logos ===")
for partner in partners:
    svg_path = os.path.join(target_dir, f"{partner}.svg")
    png_path = os.path.join(target_dir, f"{partner}.png")
    
    svg_status = f"SVG ({os.path.getsize(svg_path)} B)" if os.path.exists(svg_path) else "SVG (Missing)"
    png_status = f"PNG ({os.path.getsize(png_path)} B)" if os.path.exists(png_path) else "PNG (Missing)"
    
    print(f"* {partner:<10}: {svg_status:<20} | {png_status}")

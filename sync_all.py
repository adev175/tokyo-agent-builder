import shutil
import os
import subprocess

root_dir = os.getcwd()
tsugi_dir = os.path.join(root_dir, "tsugi")

# 1. Sync JPG/PNG assets
jpg_files = [
    "tsugi_artisan_craft_1784950768671.jpg",
    "tsugi_global_network_1784950795234.jpg",
    "tsugi_storefront_mockup_1784950781224.jpg",
    "vessel-placeholder.jpg"
]

target_folders = [root_dir, tsugi_dir, os.path.join(root_dir, "public")]

for img in jpg_files:
    src = None
    for folder in [tsugi_dir, root_dir]:
        p = os.path.join(folder, img)
        if os.path.exists(p):
            src = p
            break
    if src:
        for folder in target_folders:
            os.makedirs(folder, exist_ok=True)
            dst = os.path.join(folder, img)
            if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src):
                shutil.copyfile(src, dst)
                print(f"Synced asset {img} -> {dst}")

# 2. Sync logos
logo_dir = os.path.join(root_dir, "logos")
logo_targets = [os.path.join(tsugi_dir, "logos"), os.path.join(root_dir, "public", "logos"), os.path.join(root_dir, "tsugi_slide3_architecture", "logos")]

for f in os.listdir(logo_dir):
    src_l = os.path.join(logo_dir, f)
    if os.path.isfile(src_l):
        for lt in logo_targets:
            os.makedirs(lt, exist_ok=True)
            dst_l = os.path.join(lt, f)
            shutil.copyfile(src_l, dst_l)
            print(f"Synced logo {f} -> {dst_l}")

# 3. Sync presentation HTML
src_html = os.path.join(root_dir, "sample_presentation_tsugi_home_style.html")
dst_html_tsugi = os.path.join(tsugi_dir, "sample_presentation_tsugi_home_style.html")

shutil.copyfile(src_html, dst_html_tsugi)
print(f"Synced {src_html} -> {dst_html_tsugi}")

# 4. Re-export PDF
pdf_path = os.path.join(root_dir, "sample_presentation_tsugi.pdf")
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if os.path.exists(edge_path):
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_path}",
        f"file:///{src_html.replace('\\\\', '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Re-exported PDF, exit code:", res.returncode)
    if os.path.exists(pdf_path):
        print(f"PDF size: {os.path.getsize(pdf_path)} bytes")

print("All synchronization completed successfully!")

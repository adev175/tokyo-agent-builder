import shutil
import os

src = os.path.join(os.getcwd(), "tsugi", "sample_presentation_tsugi_home_style.html")
dst = os.path.join(os.getcwd(), "sample_presentation_tsugi_home_style.html")

shutil.copyfile(src, dst)
print(f"Synced {src} -> {dst}")

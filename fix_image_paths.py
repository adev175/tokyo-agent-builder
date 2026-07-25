import os
import shutil

root_dir = os.getcwd()
tsugi_dir = os.path.join(root_dir, "tsugi")

print("Checking images in tsugi/ vs root:")
tsugi_files = os.listdir(tsugi_dir)
for f in tsugi_files:
    if f.endswith(".jpg") or f.endswith(".png"):
        src = os.path.join(tsugi_dir, f)
        dst = os.path.join(root_dir, f)
        if not os.path.exists(dst):
            shutil.copyfile(src, dst)
            print(f"Copied missing image from tsugi to root: {f}")
        else:
            print(f"Image already in root: {f}")

print("\nChecking logos directory in root:")
logos_dir = os.path.join(root_dir, "logos")
if os.path.exists(logos_dir):
    for f in os.listdir(logos_dir):
        print(f" - logo: {f} ({os.path.getsize(os.path.join(logos_dir, f))} bytes)")


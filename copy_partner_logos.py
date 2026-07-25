import shutil
import os

src_dir = os.path.join(os.getcwd(), "logos")
target_dirs = [
    os.path.join(os.getcwd(), "tsugi", "logos"),
    os.path.join(os.getcwd(), "public", "logos")
]

for d in target_dirs:
    os.makedirs(d, exist_ok=True)

files = os.listdir(src_dir)
print("Files in logos:", files)

for f in files:
    src_path = os.path.join(src_dir, f)
    if os.path.isfile(src_path):
        for d in target_dirs:
            dst_path = os.path.join(d, f)
            shutil.copyfile(src_path, dst_path)
            print(f"Copied {f} -> {dst_path}")

print("Logo copy complete!")

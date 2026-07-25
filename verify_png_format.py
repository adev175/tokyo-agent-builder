import os

logos_dir = os.path.join(os.getcwd(), "logos")
for f in os.listdir(logos_dir):
    fpath = os.path.join(logos_dir, f)
    if os.path.isfile(fpath):
        with open(fpath, "rb") as fp:
            header = fp.read(8)
            is_png = header == b'\x89PNG\r\n\x1a\n'
            print(f"File {f}: is_valid_png = {is_png}, size = {os.path.getsize(fpath)} bytes, header = {header}")

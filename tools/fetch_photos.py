import json, os, urllib.parse, urllib.request
from io import BytesIO
from PIL import Image

OUT = "/Users/vishalkalra/Documents/Github/the-misinformation-lab/src/assets/images/photos"
UA = {"Accept": "application/json"}

# Unsplash+ ("premium"/"plus") results serve a watermarked preview unless you
# hold a paid licence — unusable, and easy to miss at thumbnail size.
# Descriptions foregrounding an individual are rejected too: a recognisable face
# under an invented headline is the exact harm this app teaches (SPEC.md §7).
FACE_WORDS = ("woman", "man ", " men", "girl", "boy", "portrait", "selfie",
              "person holding", "young", "smiling", "face", "businesswoman",
              "businessman", "team", "her ", "his ")

SCENES = {
    "reservoir": "water treatment plant aerial",
    "townhall":  "old town hall building facade",
    "kitchen":   "empty commercial kitchen stainless",
    "platform":  "empty train station platform",
    "clinic":    "clinic building exterior sign",
    "library":   "library bookshelves reading room",
    "chart":     "printed charts graphs paper report",
    "gathering": "crowd street people from behind",
    "document":  "stack of documents paperwork",
    "roadworks": "roadworks traffic cones street",
}

credits, total = [], 0
for sid, query in SCENES.items():
    url = "https://unsplash.com/napi/search/photos?per_page=30&query=" + urllib.parse.quote(query)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
            results = json.load(r).get("results", [])
    except Exception as e:
        print(f"  !! {sid}: {e}"); continue

    pick = None
    for p in results:
        if p.get("premium") or p.get("plus"):      # watermarked
            continue
        if p.get("width", 0) <= p.get("height", 1):  # portrait crops badly
            continue
        alt = (p.get("alt_description") or "").lower()
        if any(w in alt for w in FACE_WORDS):
            continue
        pick = p; break
    if not pick:
        print(f"  !! {sid}: nothing passed filters"); continue

    src = pick["urls"]["raw"] + "&w=1200&q=88&fm=jpg&fit=max"
    with urllib.request.urlopen(urllib.request.Request(src), timeout=60) as r:
        im = Image.open(BytesIO(r.read())).convert("RGB")
    if im.width > 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, f"{sid}.jpg")
    im.save(path, "JPEG", quality=78, optimize=True, progressive=True)
    kb = os.path.getsize(path)/1024; total += kb
    u = pick.get("user") or {}
    credits.append((f"{sid}.jpg", u.get("name","Unknown"), u.get("username",""),
                    pick.get("links",{}).get("html",""), pick.get("alt_description") or query))
    print(f"  ok {sid:<10} {im.width}x{im.height} {kb:5.0f} KB — {(pick.get('alt_description') or query)[:52]}")

with open(os.path.join(OUT, "CREDITS.md"), "w") as f:
    f.write("# Photo credits\n\nAll images from [Unsplash](https://unsplash.com) under the "
            "[Unsplash License](https://unsplash.com/license) — free to use, including commercially, "
            "no attribution required. Credited anyway as good practice.\n\n"
            "Unsplash+ / premium images are deliberately excluded: they serve watermarked previews "
            "without a paid licence.\n\n| File | Photographer | Source | Shows |\n|---|---|---|---|\n")
    for fn, name, un, link, desc in credits:
        f.write(f"| `{fn}` | [{name}](https://unsplash.com/@{un}) | [link]({link}) | {desc} |\n")
print(f"\n{len(credits)}/10 · {total:.0f} KB total")

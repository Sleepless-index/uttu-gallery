#!/usr/bin/env python3
"""
check-missing-images.py

Cross-checks data/roster.json and data/garments.json against the actual
image files on disk and reports anything missing.

Checks:
  - Base art:       public/art/{id}01.webp        (one per roster entry)
  - Insight-2 art:   public/art/{id}02.webp        (only for ids listed in
                     I2_ART_IDS inside lib/assets/characterAssets.ts)
  - Afflatus icons:  public/icons/afl_{afflatus}.webp
  - Rarity plates:   public/icons/bg-rare-{rarity}.webp   (rarity clamped 2-6)
  - Garment cards:   public/garments/cards/{garment.id}.webp

Usage:
    python3 scripts/check-missing-images.py

Run from anywhere inside the project; paths are resolved relative to this
script's location so it doesn't matter what your cwd is.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PUBLIC_DIR = ROOT / "public"
ASSETS_TS = ROOT / "lib" / "assets" / "characterAssets.ts"


def load_json(path: Path):
    if not path.exists():
        print(f"  ERROR: {path.relative_to(ROOT)} not found")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_i2_art_ids() -> set[int]:
    """Pull the I2_ART_IDS set straight out of the TS source so this script
    never drifts out of sync with the app's own definition of which
    characters have Insight 2 art."""
    if not ASSETS_TS.exists():
        print(f"  WARNING: {ASSETS_TS.relative_to(ROOT)} not found — "
              f"skipping Insight 2 art check")
        return set()
    content = ASSETS_TS.read_text(encoding="utf-8")
    match = re.search(r"I2_ART_IDS\s*=\s*new Set\(\[(.*?)\]\)", content, re.S)
    if not match:
        print("  WARNING: could not locate I2_ART_IDS in characterAssets.ts — "
              "skipping Insight 2 art check")
        return set()
    return {int(n) for n in re.findall(r"\d+", match.group(1))}


def flatten_afflatus(afflatus) -> list[str]:
    """roster.json's afflatus field is sometimes a string, sometimes a list
    (dual-afflatus characters like The Twins) — normalize to a list."""
    if isinstance(afflatus, list):
        return afflatus
    return [afflatus]


def clamp_rarity(rarity: int) -> int:
    return max(2, min(6, rarity))


def check_roster(roster: list[dict], i2_ids: set[int]) -> dict[str, list[str]]:
    missing = {
        "base_art": [],
        "i2_art": [],
        "afflatus_icon": [],
        "rarity_plate": [],
    }

    seen_afflatus_icons = set()
    seen_rarity_plates = set()

    for c in roster:
        cid = c["id"]
        name = c.get("name", f"id {cid}")

        base_path = PUBLIC_DIR / "art" / f"{cid}01.webp"
        if not base_path.exists():
            missing["base_art"].append(f"{name} (id {cid}) -> art/{cid}01.webp")

        if cid in i2_ids:
            i2_path = PUBLIC_DIR / "art" / f"{cid}02.webp"
            if not i2_path.exists():
                missing["i2_art"].append(f"{name} (id {cid}) -> art/{cid}02.webp")

        for afl in flatten_afflatus(c.get("afflatus")):
            key = "intellect" if str(afl).lower() == "intelligence" else str(afl).lower()
            if key in seen_afflatus_icons:
                continue
            seen_afflatus_icons.add(key)
            icon_path = PUBLIC_DIR / "icons" / f"afl_{key}.webp"
            if not icon_path.exists():
                missing["afflatus_icon"].append(f"{afl} -> icons/afl_{key}.webp")

        rarity = clamp_rarity(c.get("rarity", 2))
        if rarity not in seen_rarity_plates:
            seen_rarity_plates.add(rarity)
            plate_path = PUBLIC_DIR / "icons" / f"bg-rare-{rarity}.webp"
            if not plate_path.exists():
                missing["rarity_plate"].append(f"rarity {rarity} -> icons/bg-rare-{rarity}.webp")

    return missing


def check_garments(garments_data: list[dict]) -> list[str]:
    missing = []
    for entry in garments_data:
        char_name = entry.get("name", f"id {entry.get('id')}")
        for g in entry.get("garments", []):
            gid = g["id"]
            gname = g.get("name", f"garment {gid}")
            card_path = PUBLIC_DIR / "garments" / "cards" / f"{gid}.webp"
            if not card_path.exists():
                missing.append(f"{char_name} — {gname} (id {gid}) -> garments/cards/{gid}.webp")
    return missing


def print_section(title: str, items: list[str]):
    print(f"\n{title}: {len(items)} missing")
    for item in items:
        print(f"  - {item}")


def main():
    print(f"Checking images referenced by roster.json and garments.json")
    print(f"Project root: {ROOT}\n")

    roster = load_json(DATA_DIR / "roster.json")
    garments_data = load_json(DATA_DIR / "garments.json")
    i2_ids = load_i2_art_ids()

    roster_missing = check_roster(roster, i2_ids)
    garment_missing = check_garments(garments_data)

    print_section("Missing base character art", roster_missing["base_art"])
    print_section("Missing Insight 2 art", roster_missing["i2_art"])
    print_section("Missing afflatus icons", roster_missing["afflatus_icon"])
    print_section("Missing rarity plates", roster_missing["rarity_plate"])
    print_section("Missing garment card art", garment_missing)

    total = sum(len(v) for v in roster_missing.values()) + len(garment_missing)
    print(f"\n{'=' * 50}")
    if total == 0:
        print("All images present. Nothing missing.")
    else:
        print(f"TOTAL MISSING: {total}")
    print(f"{'=' * 50}")

    sys.exit(1 if total > 0 else 0)


if __name__ == "__main__":
    main()

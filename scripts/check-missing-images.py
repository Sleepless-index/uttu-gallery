#!/usr/bin/env python3
"""
check-missing-images.py

Cross-checks data/roster.json (characters, each with a nested `garments`
array) against the actual image files on disk and reports anything missing.

Checks:
  - Base art:       public/Characters/Base/{id}01.webp   (one per roster entry)
  - Insight-2 art:   public/Characters/Base/{id}02.webp   (only for ids listed in
                     I2_ART_IDS inside lib/assets/characterAssets.ts)
  - Afflatus icons:  public/Icons/Afflatus/afl_{afflatus}.webp
  - Rarity plates:   public/Icons/RarityBg/bg-rare-{rarity}.webp   (rarity clamped 2-6)
  - Garment cards:   public/Characters/Garments/{garment.id}.webp

Also flags the reverse problem: an {id}02.webp file that exists on disk but
whose id isn't listed in I2_ART_IDS. When that happens, the app silently
falls back to base art for that character even though Insight 2 art is
sitting right there — this is exactly the "why doesn't my new character's
I2 art show up" bug, and it happens every time new I2 art is added without
updating that manifest by hand.

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

        base_path = PUBLIC_DIR / "Characters" / "Base" / f"{cid}01.webp"
        if not base_path.exists():
            missing["base_art"].append(f"{name} (id {cid}) -> Characters/Base/{cid}01.webp")

        if cid in i2_ids:
            i2_path = PUBLIC_DIR / "Characters" / "Base" / f"{cid}02.webp"
            if not i2_path.exists():
                missing["i2_art"].append(f"{name} (id {cid}) -> Characters/Base/{cid}02.webp")

        for afl in flatten_afflatus(c.get("afflatus")):
            key = "intellect" if str(afl).lower() == "intelligence" else str(afl).lower()
            if key in seen_afflatus_icons:
                continue
            seen_afflatus_icons.add(key)
            icon_path = PUBLIC_DIR / "Icons" / "Afflatus" / f"afl_{key}.webp"
            if not icon_path.exists():
                missing["afflatus_icon"].append(f"{afl} -> Icons/Afflatus/afl_{key}.webp")

        rarity = clamp_rarity(c.get("rarity", 2))
        if rarity not in seen_rarity_plates:
            seen_rarity_plates.add(rarity)
            plate_path = PUBLIC_DIR / "Icons" / "RarityBg" / f"bg-rare-{rarity}.webp"
            if not plate_path.exists():
                missing["rarity_plate"].append(f"rarity {rarity} -> Icons/RarityBg/bg-rare-{rarity}.webp")

    return missing


def find_unregistered_i2_art(
    roster: list[dict], i2_ids: set[int], garment_ids: set[int]
) -> tuple[list[str], list[str]]:
    """Find {id}02.webp files in public/art/ whose id is a real roster
    character but isn't in I2_ART_IDS — art that exists but the app doesn't
    know to use.

    Also flags a narrower, easy-to-miss case: some garment ids happen to be
    numerically identical to a character's-id-plus-"02" (e.g. garment 301202
    looks exactly like character 3012's I2 art filename). That's harmless
    while garment cards stay in public/Characters/Garments/, but if one is ever
    misfiled into public/Characters/Base/ instead, it would otherwise be silently
    misread as that character's I2 portrait. Reported separately so a real
    "you forgot to register this" doesn't get lost among coincidental ids
    that were never meant to be I2 art at all.
    """
    roster_ids = {c["id"] for c in roster}
    art_dir = PUBLIC_DIR / "Characters" / "Base"
    if not art_dir.exists():
        return [], []

    unregistered = []
    possible_misfiled_garments = []
    id_to_name = {c["id"]: c.get("name", str(c["id"])) for c in roster}
    for path in sorted(art_dir.glob("*02.webp")):
        match = re.match(r"^(\d+)02\.webp$", path.name)
        if not match:
            continue
        cid = int(match.group(1))
        if cid not in roster_ids or cid in i2_ids:
            continue
        full_id = int(match.group(1) + "02")
        if full_id in garment_ids:
            possible_misfiled_garments.append(
                f"Characters/Base/{path.name} — id {full_id} matches a garment id, not {id_to_name[cid]}'s "
                f"(id {cid}) I2 art; likely a garment card in the wrong folder, not missing I2 art"
            )
        else:
            unregistered.append(
                f"{id_to_name[cid]} (id {cid}) -> Characters/Base/{path.name} exists but {cid} is not in I2_ART_IDS"
            )
    return unregistered, possible_misfiled_garments


def check_garments(roster_data: list[dict]) -> list[str]:
    missing = []
    for entry in roster_data:
        char_name = entry.get("name", f"id {entry.get('id')}")
        for g in entry.get("garments", []):
            gid = g["id"]
            gname = g.get("name", f"garment {gid}")
            card_path = PUBLIC_DIR / "Characters" / "Garments" / f"{gid}.webp"
            if not card_path.exists():
                missing.append(f"{char_name} — {gname} (id {gid}) -> Characters/Garments/{gid}.webp")
    return missing


def print_section(title: str, items: list[str]):
    print(f"\n{title}: {len(items)} found")
    for item in items:
        print(f"  - {item}")


def main():
    print(f"Checking images referenced by roster.json (characters + nested garments)")
    print(f"Project root: {ROOT}\n")

    roster = load_json(DATA_DIR / "roster.json")
    i2_ids = load_i2_art_ids()
    garment_ids = {g["id"] for entry in roster for g in entry.get("garments", [])}

    roster_missing = check_roster(roster, i2_ids)
    garment_missing = check_garments(roster)
    unregistered_i2, misfiled_garments = find_unregistered_i2_art(roster, i2_ids, garment_ids)

    print_section("Missing base character art", roster_missing["base_art"])
    print_section("Missing Insight 2 art", roster_missing["i2_art"])
    print_section("Missing afflatus icons", roster_missing["afflatus_icon"])
    print_section("Missing rarity plates", roster_missing["rarity_plate"])
    print_section("Missing garment card art", garment_missing)
    print_section(
        "I2 art on disk but NOT registered in I2_ART_IDS (won't display until added)",
        unregistered_i2,
    )
    print_section(
        "Garment cards possibly misfiled into public/Characters/Base/ (id coincides with a character+02 pattern)",
        misfiled_garments,
    )

    total = (
        sum(len(v) for v in roster_missing.values())
        + len(garment_missing)
        + len(unregistered_i2)
        + len(misfiled_garments)
    )
    print(f"\n{'=' * 50}")
    if total == 0:
        print("All images present and registered. Nothing to fix.")
    else:
        print(f"TOTAL ISSUES: {total}")
    print(f"{'=' * 50}")

    sys.exit(1 if total > 0 else 0)


if __name__ == "__main__":
    main()

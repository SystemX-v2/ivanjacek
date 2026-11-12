#!/usr/bin/env python3
"""Kontrola obsahu: sk.json a en.json musia mať rovnaké kľúče a žiadne prázdne hodnoty."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPECTED_PROJECTS = 6


def load(lang):
    return json.loads((ROOT / "content" / f"{lang}.json").read_text(encoding="utf-8"))


def key_paths(node, prefix=""):
    """Množina ciest ku všetkým kľúčom; polia sa porovnávajú indexmi."""
    paths = set()
    if isinstance(node, dict):
        for k, v in node.items():
            paths.add(f"{prefix}.{k}")
            paths |= key_paths(v, f"{prefix}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            paths |= key_paths(v, f"{prefix}[{i}]")
    return paths


def empty_values(node, prefix=""):
    bad = []
    if isinstance(node, dict):
        for k, v in node.items():
            bad += empty_values(v, f"{prefix}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            bad += empty_values(v, f"{prefix}[{i}]")
    elif isinstance(node, str) and not node.strip():
        bad.append(prefix)
    return bad


def main():
    errors = []
    try:
        sk, en = load("sk"), load("en")
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: {exc}")
        return 1

    only_sk = key_paths(sk) - key_paths(en)
    only_en = key_paths(en) - key_paths(sk)
    errors += [f"kľúč len v sk.json: {p}" for p in sorted(only_sk)]
    errors += [f"kľúč len v en.json: {p}" for p in sorted(only_en)]

    for lang, data in (("sk", sk), ("en", en)):
        errors += [f"{lang}: prázdna hodnota {p}" for p in empty_values(data)]
        items = data.get("projects", {}).get("items", [])
        if len(items) != EXPECTED_PROJECTS:
            errors.append(f"{lang}: počet projektov {len(items)}, očakávaných {EXPECTED_PROJECTS}")
        for item in items:
            if item.get("status") == "archive" and "url" in item:
                errors.append(f"{lang}: archívny projekt {item.get('id')} nesmie mať url")
            if item.get("status") not in ("active", "archive"):
                errors.append(f"{lang}: neplatný status v {item.get('id')}")

    for lang, data in (("sk", sk), ("en", en)):
        hero = data.get("hero", {})
        if not hero.get("role") or not hero.get("lead"):
            errors.append(f"{lang}: hero.role a hero.lead sú povinné")
        if "IDC Holding" not in hero.get("role", "") or "80" not in hero.get("lead", ""):
            errors.append(f"{lang}: hero musí uvádzať IDC Holding a tím približne 80 ľudí")
        if not hero.get("headline_pre") or not hero.get("sr_headline") or len(hero.get("words", [])) < 3:
            errors.append(f"{lang}: hero potrebuje headline_pre, sr_headline a aspoň 3 words")
        exp = data.get("expertise", {}).get("items", [])
        if len(exp) != 6:
            errors.append(f"{lang}: expertise musí mať 6 položiek, má {len(exp)}")
        arts = data.get("articles", {}).get("items", [])
        if len(arts) != 5:
            errors.append(f"{lang}: articles musí mať 5 položiek, má {len(arts)}")
        for a in arts:
            blocks = a.get("body", [])
            if not isinstance(a.get("minutes"), int) or a["minutes"] < 1:
                errors.append(f"{lang}: článok {a.get('id')} nemá minutes")
            if not blocks or any(not b.get("h") or not b.get("p") for b in blocks):
                errors.append(f"{lang}: článok {a.get('id')} má neúplné body")

    for lang, data in (("sk", sk), ("en", en)):
        photo = data.get("hero", {}).get("photo")
        if not photo or not (ROOT / photo).is_file():
            errors.append(f"{lang}: hero.photo chýba alebo súbor neexistuje: {photo}")
        if not data.get("hero", {}).get("photo_alt"):
            errors.append(f"{lang}: hero.photo_alt chýba")
        for item in data.get("projects", {}).get("items", []):
            img = item.get("image")
            if img is not None:
                if not (ROOT / img).is_file():
                    errors.append(f"{lang}: obrázok neexistuje: {img}")
                if not item.get("image_alt"):
                    errors.append(f"{lang}: {item.get('id')} má image bez image_alt")
                if item.get("image_kind") not in ("logo", "cover"):
                    errors.append(f"{lang}: {item.get('id')} má neplatný image_kind")

    for lang, data in (("sk", sk), ("en", en)):
        ids = [i.get("id") for i in data.get("projects", {}).get("items", [])]
        for item in data.get("projects", {}).get("items", []):
            details = item.get("details", {})
            if not details.get("summary"):
                errors.append(f"{lang}: {item.get('id')} nemá details.summary")
            for part in ("how", "benefits", "for"):
                if not isinstance(details.get(part), list) or not details.get(part):
                    errors.append(f"{lang}: {item.get('id')} má prázdne details.{part}")
        stats = data.get("stats", {}).get("items", [])
        if len(stats) != 4 or not all(isinstance(s.get("value"), int) and s["value"] > 0 for s in stats):
            errors.append(f"{lang}: stats musí mať 4 položky s kladným celým číslom value")
        segments = data.get("segments", {}).get("items", [])
        if not segments:
            errors.append(f"{lang}: chýbajú segmenty")
        for seg in segments:
            for pid in seg.get("projects", []):
                if pid not in ids:
                    errors.append(f"{lang}: segment {seg.get('id')} odkazuje na neznámy projekt {pid}")
        if not data.get("marquee", {}).get("items"):
            errors.append(f"{lang}: chýba marquee.items")

    ids_sk = [i.get("id") for i in sk.get("projects", {}).get("items", [])]
    ids_en = [i.get("id") for i in en.get("projects", {}).get("items", [])]
    if ids_sk != ids_en:
        errors.append(f"poradie id projektov sa líši: {ids_sk} vs {ids_en}")

    if errors:
        print("FAIL")
        print("\n".join(errors))
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

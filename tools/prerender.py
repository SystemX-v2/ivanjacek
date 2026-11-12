#!/usr/bin/env python3
"""Predvykreslenie slovenskej verzie do index.html (pre vyhľadávače a AI crawlery bez JavaScriptu).

Doplní texty z content/sk.json do značiek <!--ssr:...--> a data-i18n prvkov, hlavičku (title, description,
canonical, Open Graph, Twitter Card, JSON-LD) a vygeneruje sitemap.xml a llms.txt.
Skript je idempotentný: spusti ho po každej zmene content/sk.json.   python3 tools/prerender.py
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://ivanjacek.sk/"
VER = "20261119"
OG_IMAGE = BASE + "assets/og-image.jpg"
e = html.escape


def num(n):
    return f"{n:,}".replace(",", " ")


def sub_marker(page, name, inner):
    pat = re.compile(r"(<!--ssr:%s-->)(.*?)(<!--/ssr:%s-->)" % (re.escape(name), re.escape(name)), re.S)
    if not pat.search(page):
        raise SystemExit(f"chýba značka ssr:{name} v index.html")
    return pat.sub(lambda m: m.group(1) + inner + m.group(3), page, count=1)


def get(obj, path):
    for k in path.split("."):
        obj = obj[k]
    return obj


def head_block(c):
    m = c["meta"]
    ct = c["contact"]
    active = [p["url"] for p in c["projects"]["items"] if p.get("url")]
    person = {
        "@type": "Person",
        "@id": BASE + "#ivan",
        "name": c["hero"]["name"],
        "url": BASE,
        "image": BASE + "assets/ivan.webp",
        "jobTitle": "Kreatívny stratég",
        "description": m["description"],
        "email": "mailto:" + ct["email"],
        "telephone": ct["phone"],
        "sameAs": [ct["linkedin"]] + active,
        "knowsAbout": [i["title"] for i in c["expertise"]["items"]],
        "worksFor": {"@type": "Organization", "name": "Buduj Značku", "url": "https://www.budujznacku.sk"},
    }
    site = {"@type": "WebSite", "@id": BASE + "#web", "url": BASE, "name": c["hero"]["name"],
            "inLanguage": ["sk", "en"], "author": {"@id": BASE + "#ivan"}}
    ld = json.dumps({"@context": "https://schema.org", "@graph": [person, site]}, ensure_ascii=False, indent=2)
    t, d = e(m["title"], quote=True), e(m["description"], quote=True)
    alt = e(c["hero"]["photo_alt"], quote=True)
    lines = [
        f"<title>{e(m['title'])}</title>",
        f'<meta name="description" content="{d}">',
        '<meta name="author" content="Ivan Jaček">',
        '<meta name="robots" content="index, follow, max-image-preview:large">',
        f'<link rel="canonical" href="{BASE}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Ivan Jaček">',
        '<meta property="og:locale" content="sk_SK">',
        '<meta property="og:locale:alternate" content="en_US">',
        f'<meta property="og:title" content="{t}">',
        f'<meta property="og:description" content="{d}">',
        f'<meta property="og:url" content="{BASE}">',
        f'<meta property="og:image" content="{OG_IMAGE}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{alt}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{t}">',
        f'<meta name="twitter:description" content="{d}">',
        f'<meta name="twitter:image" content="{OG_IMAGE}">',
        f'<meta name="twitter:image:alt" content="{alt}">',
        '<script type="application/ld+json">\n' + ld + "\n  </script>",
    ]
    return "\n  " + "\n  ".join(lines) + "\n  "


def render(c):
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    ui = c["ui"]

    # data-i18n texty
    def i18n(m):
        value = _safe_get(c, m.group(3))
        return m.group(1) + e(value, quote=False) + m.group(5) if isinstance(value, str) else m.group(0)

    page = re.sub(r'(<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)(.*?)(</\2>)', i18n, page, flags=re.S)

    page = sub_marker(page, "head", head_block(c))
    page = sub_marker(page, "rotator", f'<span class="is-active">{e(c["hero"]["words"][0])}</span>')
    page = sub_marker(page, "marquee-label", e(c["marquee"]["label"]))
    items = "".join(f"<li>{e(t)}</li>" for t in c["marquee"]["items"])
    page = sub_marker(page, "marquee-a", items)
    page = sub_marker(page, "marquee-b", items)

    page = sub_marker(page, "expertise-list", "".join(
        f'<article class="expertise-item"><h3>{e(i["title"])}</h3><p>{e(i["text"])}</p></article>'
        for i in c["expertise"]["items"]))

    page = sub_marker(page, "stat-list", "".join(
        f'<li class="stat"><span class="stat-value" data-value="{s["value"]}" data-suffix="{e(s.get("suffix", ""))}">'
        f'{num(s["value"])}{e(s.get("suffix", ""))}</span><span class="stat-label">{e(s["label"])}</span></li>'
        for s in c["stats"]["items"]))

    cards = []
    for p in c["projects"]["items"]:
        archive = p.get("status") == "archive"
        media = ""
        if p.get("image"):
            kind = "cover" if p.get("image_kind") == "cover" else "logo"
            media = (f'<div class="media {kind}"><img src="{e(p["image"])}" alt="{e(p.get("image_alt", ""))}" '
                     f'loading="lazy" decoding="async"></div>')
        tag = f'<span class="tag">{e(ui["archive"])}</span>' if archive else ""
        cards.append(
            f'<article class="project{" archive" if archive else ""}" id="project-{e(p["id"])}">{media}'
            f'<h3>{e(p["name"])}</h3>{tag}<p class="role">{e(p["role"])}</p><p class="text">{e(p["text"])}</p>'
            f'<button type="button" class="open" aria-label="{e(ui["detail"])}: {e(p["name"])}">{e(ui["detail"])}</button>'
            f"</article>")
    page = sub_marker(page, "project-list", "".join(cards))

    names = {p["id"]: p["name"] for p in c["projects"]["items"]}
    page = sub_marker(page, "segment-list", "".join(
        f'<article class="segment"><h3>{e(s["name"])}</h3><p>{e(s["text"])}</p><div class="chips">'
        + "".join(f'<button type="button" class="chip">{e(names[i])}</button>' for i in s["projects"])
        + "</div></article>" for s in c["segments"]["items"]))

    page = sub_marker(page, "article-list", "".join(
        f'<article class="article"><p class="meta">{e(a["tag"])} – {a["minutes"]} {e(ui["minutes_label"])}</p>'
        f'<h3><a href="clanky/{e(a["id"])}.html">{e(a["title"])}</a></h3><p class="perex">{e(a["perex"])}</p>'
        f'<button type="button" class="open" aria-label="{e(ui["read"])}: {e(a["title"])}">{e(ui["read"])}</button></article>'
        for a in c["articles"]["items"]))

    ct = c["contact"]
    page = sub_marker(page, "contact-email", e(ct["email"]))
    page = sub_marker(page, "contact-phone", e(ct["phone"]))
    page = sub_marker(page, "contact-linkedin", e(ct["linkedin_label"]))
    page = re.sub(r'(<a id="contact-email" href=")[^"]*"', lambda m: m.group(1) + "mailto:" + e(ct["email"]) + '"', page)
    page = re.sub(r'(<a id="contact-phone" href=")[^"]*"',
                  lambda m: m.group(1) + "tel:" + re.sub(r"\s+", "", ct["phone"]) + '"', page)
    page = re.sub(r'(<a id="contact-linkedin" href=")[^"]*"', lambda m: m.group(1) + e(ct["linkedin"]) + '"', page)

    (ROOT / "index.html").write_text(page, encoding="utf-8")


def _safe_get(c, path):
    try:
        return get(c, path)
    except (KeyError, TypeError):
        return None


def write_sitemap(c):
    today = date.today().isoformat()
    urls = [BASE, BASE + "sukromie.html", BASE + "mapa-stranky.html"]
    urls += [BASE + "clanky/" + a["id"] + ".html" for a in c["articles"]["items"]]
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + body + "</urlset>\n", encoding="utf-8")


def write_llms(c):
    out = [f"# {c['hero']['name']}", "", f"> {c['meta']['description']}", "",
           c["hero"]["lead"], "", "## Projekty", ""]
    for p in c["projects"]["items"]:
        link = f"[{p['name']}]({p['url']})" if p.get("url") else p["name"]
        out.append(f"- {link}: {p['role']}. {p['text']}")
    out += ["", "## Odborné články", ""]
    for a in c["articles"]["items"]:
        out.append(f"- [{a['title']}]({BASE}clanky/{a['id']}.html): {a['perex']}")
    out += ["", "## Kontakt", "",
            f"- E-mail: {c['contact']['email']}", f"- Telefón: {c['contact']['phone']}",
            f"- LinkedIn: {c['contact']['linkedin']}", "",
            "## Zdroje", "",
            f"- [Web]({BASE})",
            f"- [Celý obsah webu, slovensky ({BASE}content/sk.json)]({BASE}content/sk.json)",
            f"- [Celý obsah webu, anglicky ({BASE}content/en.json)]({BASE}content/en.json)",
            f"- [Ochrana osobných údajov]({BASE}sukromie.html)", ""]
    (ROOT / "llms.txt").write_text("\n".join(out), encoding="utf-8")


def write_articles(c):
    out_dir = ROOT / "clanky"
    out_dir.mkdir(exist_ok=True)
    ui = c["ui"]
    person = {"@type": "Person", "@id": BASE + "#ivan", "name": c["hero"]["name"], "url": BASE}
    for a in c["articles"]["items"]:
        url = f"{BASE}clanky/{a['id']}.html"
        ld = json.dumps({
            "@context": "https://schema.org", "@type": "Article", "@id": url + "#article",
            "headline": a["title"], "description": a["perex"], "inLanguage": "sk",
            "mainEntityOfPage": url, "image": OG_IMAGE, "author": person,
            "articleSection": a["tag"], "publisher": {"@type": "Organization", "name": "Buduj Značku s.r.o.", "url": "https://www.budujznacku.sk"},
            "isPartOf": {"@type": "WebSite", "@id": BASE + "#web"},
        }, ensure_ascii=False, indent=2)
        body = "".join(
            f"<h2>{e(b['h'])}</h2>" + "".join(f"<p>{e(p)}</p>" for p in b["p"]) for b in a["body"])
        t, d = e(a["title"] + " | Ivan Jaček", quote=True), e(a["perex"], quote=True)
        page = f"""<!doctype html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(a["title"])} | Ivan Jaček</title>
  <meta name="description" content="{d}">
  <meta name="author" content="Ivan Jaček">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Ivan Jaček">
  <meta property="og:locale" content="sk_SK">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{OG_IMAGE}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{t}">
  <meta name="twitter:description" content="{d}">
  <meta name="twitter:image" content="{OG_IMAGE}">
  <meta name="theme-color" content="#0d1b2e">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/css/fonts.css?v={VER}">
  <link rel="stylesheet" href="/css/style.css?v={VER}">
  <script type="application/ld+json">
{ld}
  </script>
  <script src="/js/consent.js?v={VER}"></script>
</head>
<body>
  <main class="legal">
    <p><a href="/#articles">← Ivan Jaček · {e(c["articles"]["heading"])}</a></p>
    <p>{e(a["tag"])} – {a["minutes"]} {e(ui["minutes_label"])}</p>
    <h1>{e(a["title"])}</h1>
    <p><strong>{e(a["perex"])}</strong></p>
    {body}
    <hr>
    <p>Autor: <a href="/">Ivan Jaček</a> · <a href="/sukromie.html">{e(ui["privacy"])}</a> · <button type="button" class="linklike" id="cookie-settings">{e(ui["cookies"])}</button></p>
  </main>
</body>
</html>
"""
        (out_dir / f"{a['id']}.html").write_text(page, encoding="utf-8")


def write_sitemap_page(c):
    p = ROOT / "mapa-stranky.html"
    s = p.read_text(encoding="utf-8")
    items = "".join(f'      <li><a href="clanky/{a["id"]}.html">{e(a["title"])}</a></li>\n' for a in c["articles"]["items"])
    block = "<!--ssr:articles-->\n" + items + "      <!--/ssr:articles-->"
    s = re.sub(r"<!--ssr:articles-->.*?<!--/ssr:articles-->", lambda m: block, s, flags=re.S)
    p.write_text(s, encoding="utf-8")


if __name__ == "__main__":
    content = json.loads((ROOT / "content" / "sk.json").read_text(encoding="utf-8"))
    render(content)
    write_sitemap(content)
    write_articles(content)
    write_sitemap_page(content)
    write_llms(content)
    print("prerender OK")

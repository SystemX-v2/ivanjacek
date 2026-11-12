# Osobná stránka Ivana Jačka

Statická dvojjazyčná (SK/EN) stránka, bez build nástrojov.

## Lokálny beh

```bash
python3 -m http.server 8000
```

Potom otvor http://localhost:8000. Cez `file://` stránka nefunguje, lebo texty sa načítavajú z `content/*.json`. Ak je port 8000 obsadený, zmeň číslo portu.

## Pridanie projektu

Pridaj záznam do poľa `projects.items` v **oboch** súboroch `content/sk.json` a `content/en.json` (rovnaké `id` a poradie). Polia: `id`, `name`, `role`, `text`, `url`, `status` (`active` alebo `archive`; archívny projekt nemá `url`). Potom spusti kontrolu:

```bash
python3 tools/check_content.py
```

Musí vypísať `OK`. Ak počet projektov nie je 6, uprav `EXPECTED_PROJECTS` v `tools/check_content.py`.

## Predvykreslenie (SEO a AI crawlery)

Po každej zmene `content/sk.json` spusti `python3 tools/prerender.py`. Doplní slovenský obsah priamo do `index.html` (aby ho videli vyhľadávače a AI bez JavaScriptu), hlavičku (title, Open Graph, JSON-LD) a vygeneruje `sitemap.xml` a `llms.txt`.

## Nasadenie

```bash
rsync -av --exclude='logo-budujznacku.png' index.html 404.html sukromie.html robots.txt sitemap.xml llms.txt manifest.webmanifest favicon.ico apple-touch-icon.png .htaccess assets css js content hostcreator:web/
```

`.htaccess` obsahuje presmerovania (http→https, www→bez www) a security hlavičky vrátane CSP. Keď sa pridá Google Analytics, CSP v `.htaccess` treba rozšíriť o `googletagmanager.com` a `google-analytics.com`.

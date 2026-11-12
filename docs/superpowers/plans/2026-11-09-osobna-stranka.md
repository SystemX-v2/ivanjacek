# Osobná stránka Ivana Jačka – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jednostránková dvojjazyčná (SK/EN) osobná stránka Ivana Jačka s úvodom, projektmi a kontaktom.

**Architecture:** Statické `index.html` + `css/style.css` + `js/app.js`. Texty sú v `content/sk.json` a `content/en.json`, `app.js` ich načíta a vykreslí podľa zvoleného jazyka. Projekty sú pole v JSON, nový projekt = jeden záznam. Bez build nástrojov.

**Tech Stack:** HTML, CSS, vanilla JS, `python3 -m http.server` na lokálny beh, `python3` skript na kontrolu obsahu.

**Spec:** `docs/superpowers/specs/2026-11-09-osobna-stranka-design.md`

## Global Constraints

- Jazyky: slovenčina (predvolená) a angličtina, prepínač SK/EN v hlavičke, voľba sa zapamätá (`localStorage`, v `try/catch`).
- Farby: nočná modrá ako základ, mäkká biela na text, jeden akcent. Nie krémová/terakotová ani čierna/neónová kombinácia.
- Písmo: výrazné serifové na nadpisy, čisté sans na text, plná podpora slovenskej diakritiky.
- Pohyb: jedna úvodná animácia, rešpektuje `prefers-reduced-motion`.
- Kvalita: responzívne na mobile (bez horizontálneho scrollu), viditeľný focus pre klávesnicu, dostatočný kontrast.
- Bez životopisu, príbehu, blogu, podstránok, formulára a CMS.
- Texty len z overených faktov v špecifikácii; nič sa nevymýšľa. Názov komunity je „Podnikavci v Seredi", doména Seredanu je `seredan.sk`.
- Úspešný Slovák je ukončený projekt: označenie „archív", minulý čas, bez tvrdenia o Antarktíde a bez „prvá Slovenka" pri Rebrovej.
- Kontakt: Ivan Jaček, info@budujznacku.sk, +421 908 714 705, LinkedIn https://www.linkedin.com/in/ivanjacek.
- Priečinok nie je git repozitár, preto plán neobsahuje commity.

## Review Focus

- Chýbajúci kľúč v jednom jazyku: kontrolný skript musí zlyhať, ak sa kľúče `sk.json` a `en.json` líšia.
- `localStorage` nedostupné (súkromné okno): stránka sa zobrazí v slovenčine bez chyby.
- Veľmi úzky displej (320 px): žiadny horizontálny scroll, karty sa poskladajú pod seba.
- Nenačítaný JSON (otvorenie cez `file://`): zobrazí sa zrozumiteľná správa, ako spustiť lokálny server.
- Používateľ s `prefers-reduced-motion`: úvodná animácia sa nespustí.

---

### Task 1: Obsah a kontrola obsahu

**Files:**
- Create: `content/sk.json`, `content/en.json`
- Create: `tools/check_content.py`

**Interfaces:**
- Produces: štruktúra JSON používaná v Tasku 2 a 3:
  `{ "meta": {"title","description"}, "nav": {"projects","contact"}, "hero": {"name","tagline","cta"}, "projects": {"heading","items":[{"id","name","role","text","url","status"}]}, "contact": {"heading","email","phone","linkedin"}, "ui": {"language","error"} }`
  `status` je `"active"` alebo `"archive"`; archívny projekt nemá `url`.

- [ ] **Step 1: Write `tools/check_content.py`** – skript načíta oba JSON súbory a zlyhá (exit 1) ak: sa množiny kľúčov (rekurzívne) líšia, akákoľvek hodnota je prázdna, počet `projects.items` je iný ako 6, alebo `id` projektov nie sú zhodné v poradí. Vypíše `OK` pri úspechu.
- [ ] **Step 2: Run it to verify it fails**
  Run: `python3 tools/check_content.py`
  Expected: FAIL (súbory ešte neexistujú)
- [ ] **Step 3: Write `content/sk.json` a `content/en.json`** s týmito projektmi v tomto poradí (`id`, rola Ivana, fakty zo špecifikácie):
  1. `seredan` – spoluzakladateľ; lokálne médium zo Serede (rozhovory, články, reportáže, podcast), https://www.seredan.sk
  2. `budujznacku` – zakladateľ a kreatívny stratég; kreatívno-strategická video agentúra, https://www.budujznacku.sk
  3. `filmomeste` – zakladateľ; dokumentárny cyklus o slovenských mestách (Sereď, Senec, Galanta, Šaľa), https://filmomeste.sk
  4. `podnikavci` – autor, organizátor a prednášajúci; komunita lokálnych podnikateľov, neformálne stretnutia od leta 2025, vstup voľný, https://www.facebook.com/groups/podnikavci.sered
  5. `uspesnyslovak` – autor a moderátor, `status: "archive"`; päť hostí: Jimi Cimbala, Martin Navrátil, Filip Kuna, Monika Chochlíková, Soňa Rebrová; bez `url`
  6. `systemx` – zakladateľ a konateľ; softvér a webové systémy na mieru, https://systemx.sk
  Hero: meno „Ivan Jaček", tagline v jednej vete o tom, že spája stratégiu, video a komunitu (SK aj EN).
- [ ] **Step 4: Run it to verify it passes**
  Run: `python3 tools/check_content.py`
  Expected: `OK`

### Task 2: Kostra stránky a dizajn

**Files:**
- Create: `index.html`, `css/style.css`, `js/app.js`

**Interfaces:**
- Consumes: JSON štruktúra z Tasku 1.
- Produces: `js/app.js` exportuje (globálne) `loadLang(lang: "sk"|"en"): Promise<void>` a `render(content: object): void`; `index.html` obsahuje `<header>` s tlačidlami `[data-lang="sk"]` a `[data-lang="en"]`, sekcie `#hero`, `#projects` (kontajner `#project-list`), `#contact`.

- [ ] **Step 1: Write `index.html`** so sémantickou štruktúrou (`header`, `main`, `footer`), `lang` atribútom meneným z JS, odkazom „preskočiť na obsah", `<noscript>` správou.
- [ ] **Step 2: Write `css/style.css`** – tokeny farieb ako CSS premenné (nočná modrá, mäkká biela, jeden akcent), serif nadpisy a sans text (Google Fonts s podporou latin-ext), dĺžka riadku do 70 znakov, `:focus-visible` obrys, jedna úvodná animácia v `@media (prefers-reduced-motion: no-preference)`. Hero: veľký typografický titul s menom, nie obrázok.
- [ ] **Step 3: Write `js/app.js`** – `loadLang` načíta `content/<lang>.json` cez `fetch`, uloží voľbu do `localStorage` v `try/catch`, volá `render`. Pri zlyhaní načítania vypíše do `#hero` správu „Spusti stránku cez lokálny server: python3 -m http.server" (SK/EN). Predvolený jazyk: uložený, inak `sk`.
- [ ] **Step 4: Verify in browser**
  Run: `python3 -m http.server 8000` v koreni projektu a otvor `http://localhost:8000`.
  Expected: hero s menom a taglinom, prepínač SK/EN mení texty, v konzole žiadne chyby, `localStorage.clear()` + reload vráti slovenčinu.

### Task 3: Sekcia Projekty

**Files:**
- Modify: `js/app.js` (funkcia `render`), `css/style.css`

**Interfaces:**
- Consumes: `projects.items` z Tasku 1, kontajner `#project-list` z Tasku 2.
- Produces: `renderProjects(items: object[]): void` vytvára pre každý projekt `<article>` s názvom, rolou, textom a odkazom (len ak má `url`); archívny projekt má viditeľný štítok „Archív"/„Archive" a nie je odkaz.

- [ ] **Step 1: Implement `renderProjects`** v `js/app.js`, volaná z `render`. Odkazy majú `rel="noopener"` a otvárajú sa v novej karte.
- [ ] **Step 2: Style** – mriežka kariet: 2 stĺpce na desktope, 1 stĺpec pod 700 px; karty nemajú rovnaký vzhľad pre všetko (archív je vizuálne tlmenejší). Žiadne generické ikony ani číslovanie.
- [ ] **Step 3: Verify in browser**
  Expected: 6 kariet v poradí z Tasku 1; Úspešný Slovák má štítok archív a nie je odkaz; pri šírke 320 px (`resize_window` 320×700) nie je horizontálny scroll.

### Task 4: Kontakt, pätička a záverečná kontrola

**Files:**
- Modify: `index.html`, `js/app.js`, `css/style.css`

**Interfaces:**
- Consumes: `contact` a `ui` z Tasku 1.

- [ ] **Step 1: Implement kontaktnú sekciu** – e-mail (`mailto:`), telefón (`tel:`), LinkedIn; pätička s názvom Buduj Značku s.r.o. a rokom.
- [ ] **Step 2: Run content check**
  Run: `python3 tools/check_content.py`
  Expected: `OK`
- [ ] **Step 3: Verify in browser** – SK a EN, desktop (1280 px) a mobil (375 px): všetky odkazy fungujú, navigácia klávesnicou (Tab) ukazuje focus na každom ovládacom prvku, s emuláciou `prefers-reduced-motion` sa úvodná animácia nespustí, kontrast textu na pozadí je čitateľný. Pozri screenshot desktopu aj mobilu a oprav vizuálne chyby.
- [ ] **Step 4: Write `README.md`** – dva príkazy: lokálny beh (`python3 -m http.server 8000`) a ako pridať projekt (záznam do oboch JSON).

---

## Self-review

- **Spec coverage:** úvod (T2), projekty vrátane archívu a overených hostí (T1, T3), kontakt (T4), SK/EN (T1, T2), a11y a pohyb (T2, T4), testovanie v prehliadači (T2–T4).
- **Konzistencia:** `status`, `url`, `items` a funkcie `loadLang`/`render`/`renderProjects` sú použité rovnako vo všetkých taskoch.
- **Hosťov Úspešného Slováka** zapisuje T1 do textu karty; mená sú len overené.

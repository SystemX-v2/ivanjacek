# Osobná stránka Ivana Jačka – návrh

## Cieľ
Reprezentatívna, moderná a prehľadná osobná stránka Ivana Jačka pre všetkých rovnako (firmy, mestá, médiá, komunita). Ukazuje, kto je, a prehľadne zhromažďuje jeho projekty. Bez osobného príbehu.

## Rozsah
Jedna stránka (single page) s tromi sekciami:
1. **Úvod** – meno, jedna veta o tom, čo robí, a odkazy na Projekty a Kontakt.
2. **Projekty** – prehľad kariet: Seredan, BudujZnačku, Film o meste, Podnikaví v Seredi, Úspešný Slovák, SystemX. Každá karta má názov, rolu Ivana, 1–2 vety a odkaz na web.
3. **Kontakt** – e-mail, telefón, LinkedIn.

Mimo rozsahu: životopis a príbeh, blog, podstránky, formulár, CMS.

## Jazyky
Slovenčina (predvolená) a angličtina. Prepínač SK/EN v hlavičke, voľba sa zapamätá. Texty sú v dvoch súboroch (`content/sk.json`, `content/en.json`).

## Technika (prístup A)
Statické HTML, CSS a malý JS, bez build nástrojov, otvorí sa lokálne aj cez jednoduchý server. Projekty sú v jednom dátovom poli, nový projekt = jeden záznam. Nasadenie neskôr cez SSH (rsync).

## Dizajn
- **Farby:** nočná modrá ako základ, mäkká biela na text, jeden akcent.
- **Písmo:** výrazné serifové na nadpisy, čisté sans na text, plná podpora slovenčiny.
- **Pohyb:** jedna úvodná animácia, inak minimum. Rešpektuje `prefers-reduced-motion`.
- **Kvalita:** responzívne na mobile, viditeľný focus pre klávesnicu, dostatočný kontrast.

## Obsah a jeho zdroje
Texty vychádzajú len z toho, čo je verejne na budujznacku.sk, filmomeste.sk a systemx.sk. Nič sa nevymýšľa.

### Overené fakty o projektoch (zo seredan.sk, 9. 11. 2026)
- **Seredan.sk:** lokálne médium zo Serede (rozhovory, články, reportáže, podcasty, krátke videá). Pôvodne video podcast, ktorý založili Lukáš Klčo a Ivan Jaček. Kategórie: rozhovory (51), lokálna firma (19), stretnutia (6). Spotify podcast, Facebook, Instagram, TikTok, YouTube @budujznacku-sk. Aktivity: stretnutia podnikavcov, Dokument o Seredi, kreatívne videá.
- **Podnikavci v Seredi** (názov na webe je „Podnikavci", nie „Podnikaví"): komunita lokálnych podnikateľov, živnostníkov a freelancerov. Neformálne stretnutia v kaviarni (Vespa Caffe, Sereď) od leta 2025, vstup voľný, často s tematickou časťou (platená reklama, natáčanie mobilom, AI, e-fakturácia). Spoločné video z decembra 2025 malo 50 000 organických zhliadnutí. Facebook skupina `podnikavci.sered`. Seredan je uvedený ako záštita.
- Rola Ivana (od neho): spoluzakladateľ Seredanu. Podnikavcov v Seredi vymyslel, zrealizoval a organizuje – pozýva ľudí a prednáša.
- **Úspešný Slovák (od Ivana):** ukončený projekt, v minulom čase. Päť hostí: gitarista Jimi Cimbala (zápis potvrdený Ivanom), cestovateľ Martin Navrátil (Travelistan), marketér Filip Kuna, thajboxerka Monika Chochlíková (majsterka sveta WMC 2021) a diaľková plavkyňa Soňa Rebrová (La Manche sólo 8. 9. 2023, druhá Slovenka; nie „prvá" – tá bola Zuzana Jusková; plávala v Arktíde v mínusovej vode a v Dunaji pri 2 °C, preplávala slovenský úsek Dunaja Devín–Ostrihom, 170 km; [Aktuality.sk](https://www.aktuality.sk/clanok/ua0gUhn/plavkyna-sona-rebrova-bojuje-s-ladom-aj-ludmi-naco-tam-lezies-pytaju-sa/)). Antarktída sa nepíše, nie je overená.

### Otvorené položky
- Karta Úspešný Slovák sa zobrazí ako ukončený projekt (označenie „archív"). Všetci piati hostia majú overené mená aj popis.
- Fotku Ivana a logá projektov možno použiť z jeho verejných webov (zdroj: jeho vlastné weby) alebo nahradiť zástupnými; vloží sa do `assets/`.

## Testovanie
Kontrola v prehliadači: desktop a mobil, SK aj EN, prepínač jazyka, odkazy a prístupnosť (klávesnica, kontrast).

## Dodatok z 2026-11-09 (po prvej verzii): modernizácia a rozšírený obsah
Ivan požadoval modernejší vzhľad s animáciami, menšiu fotku a viac textu ku každému projektu. Bez „nevýhod" (preklep v zadaní).
- **Rozsah rozšírený o:** pás klientov (marquee), čísla s počítadlami (51 rozhovorov, 4 mestá, 15 referenčných klientov SystemX, 50 000 zhliadnutí), sekciu „Komu pomáham" (5 segmentov) a detail každého projektu v dialógu so záložkami Ako to funguje, Výhody a Pre koho.
- **Vzhľad:** animované pozadie, meno po písmenách, fotka menšia v oblúku, karty projektov so svetlom podľa kurzora, animácie pri rolovaní, ukazovateľ pokroku. Všetko sa vypína pri `prefers-reduced-motion`.
- **Obsah:** len overené fakty z Ivanových webov a z jeho zadania; žiadne limity ani nevýhody.

## Dodatok 2 (2026-11-09): odborný úvod a články
Ivan chce vecný, odborný tón namiesto „hviezdneho" úvodu.
- **Úvod:** menšie meno (bežný nadpis), riadok s funkciami, 2-vetové hlavné tvrdenie, malá fotka. Sekcia „Čo robím" so 6 oblasťami (značky a stratégia, video a podcasty, verejný sektor a firmy, komunity a eventy, workshopy, AI a digitalizácia).
- **Odborné články:** 5 konceptov (značka, AI v malej firme, mesto a firmy, softvér na mieru, komunita), každý v SK aj EN, otvárajú sa v dialógu. Texty vychádzajú len z overených faktov; sú to koncepty na Ivanovo schválenie.
- **Čaká na Ivana:** manažérska kariéra (doplní neskôr) a údaje z LinkedIn profilu (profil je za prihlásením, nedostupný).

## Dodatok 3 (2026-11-09): údaje z LinkedIn profilu
Ivan vložil text svojho LinkedIn profilu a príspevkov. Použité (jeho vlastné tvrdenia): ex-manažér IDC Holding, tím približne 80 ľudí a projekty v hodnote státisícov eur; titul „Projektový režisér"; lokálny Reel pre pizzeriu s 1 000 000+ organickými zhliadnutiami; B2G (samospráva a firmy) ako segment Filmu o meste; FakturujX (vlastný bezplatný fakturačný program); wienerberger Slovensko medzi podporovateľmi pilotného filmu. Neuvedené: odmietnutia konkrétnych firiem (Samsung, DHL) a údaje tretích osôb.

## Dodatok 4 (2026-11-09): nový úvod „mapa prepojení"
Úvod stavia na tom, že Ivan prepája firmy, mestá, komunity a technológie: nadpis „Budujem …" s meniacim sa slovom (značky, komunity, dokumenty o mestách, digitálne systémy, partnerstvá B2G), karta s menom a funkciou, a vpravo fotka v strede kruhu, okolo ktorej obiehajú logá 6 projektov prepojené animovanými čiarami. Klik na logo otvorí detail projektu. Pri `prefers-reduced-motion` sa nič neotáča ani nemení; čítačky obrazovky dostanú celú vetu.

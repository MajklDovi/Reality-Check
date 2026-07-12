# PROJECT_STATUS

Stav k: 2026-07-12 · Fáze: **externí realitní nabídky** (fáze 3)

## Co bylo dokončeno

### Fáze 1 — technický základ

- ✅ Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, PostgreSQL + Prisma 7
- ✅ Auth.js v5 (credentials, JWT, role USER/ADMIN), middleware + layout ochrana
- ✅ Komponentová knihovna, layout, stránky `/`, `/login`, `/register`, `/dashboard`,
  `/profile`, `/settings`, `/admin`

### Fáze 2 — onboarding a profily hledání

- ✅ 8krokový průvodce (`/onboarding`) s progress barem, návratem zpět, průběžným
  ukládáním draftu a obnovením; validace každého kroku (Zod, sdílené klient/server)
- ✅ Správa profilů `/search-profiles` (+ new/[id]/[id]/edit): duplikace,
  aktivace/deaktivace, výchozí profil, smazání; konfigurovatelné limity plánů
  (`src/config/plans.ts`, FREE = 1 aktivní profil, vynucováno v server actions)
- ✅ Kritéria jako `Preference` řádky s váhami 10/7/4/2/0 a `isRequired`

### Fáze 3 — externí nabídky (tato fáze)

- ✅ Datový model: `PropertyListing.addedByUserId` (vlastník záznamu),
  `monthlyCosts`, `userNote`, `Property.hasLoggia`;
  `ListingStatus` zjednodušen na ACTIVE / INACTIVE / UNKNOWN / REMOVED
- ✅ Přidání nabídky dvěma způsoby (`/properties/new`):
  1. **vložením URL** — validace URL, identifikace domény, přiřazení zdroje,
     uložení původního odkazu, načtení povolených OG metadat (titulek, canonical,
     náhled jen při `allowPreviewImages`), následná kontrola ve formuláři
  2. **ručním formulářem** — všech ~30 polí ze zadání (zdroj, parametry, lokalita,
     vybavení vč. lodžie, energetika, prodejce, měsíční náklady, poznámky)
- ✅ Modulární adaptéry zdrojů (`src/lib/source-adapters/`): generic (Open Graph),
  Sreality / Bezrealitky / Reality.iDNES placeholdery (doména + OG + externí id
  z URL), generic adaptér realitních kanceláří (RE/MAX, M&M, Reality.cz).
  Jediný zdvořilý požadavek: timeout 6 s, max 512 KB, žádný scraping.
- ✅ Stránky `/properties` (grid karet), `/properties/new`, `/properties/[id]`
  (detail bez kopírování inzerátu: parametry, zdroj, datum přidání a poslední
  kontroly, úplnost, poznámky, tlačítko na původní inzerát, vývoj ceny,
  prázdné místo pro budoucí AI analýzu), `/properties/[id]/edit`
- ✅ Karta nabídky: náhled/placeholder, dispozice, typ, lokalita, cena, cena/m²,
  výměra, zdroj, stav, úplnost dat + tlačítka Detail / Původní inzerát
  (`target="_blank" rel="noopener noreferrer"`) / Uložit / Porovnat
- ✅ Pravidla náhledů: obrázek jen z povolených metadat (`allowPreviewImages`)
  nebo po ručním vložení vlastníkem (`imageUsageAllowed`); jinak placeholder
  podle typu nemovitosti; externí obrázky se lokálně neukládají
- ✅ Cena za m² se počítá automaticky (živě ve formuláři i při uložení)
- ✅ Úplnost dat z 8 klíčových polí → vysoká (≥75 %) / střední (≥50 %) / nízká
- ✅ Stav nabídky měnitelný uživatelem (select na detailu), mazání s potvrzením
- ✅ Oprávnění: nabídku vidí a upravuje jen ten, kdo ji přidal (+ admin); cizí
  detail vrací 404
- ✅ Admin správa zdrojů `/admin/sources`: název, doména, logo, aktivní stav,
  typ integrace, povolení náhledů, povolení metadat; vytvoření/úprava/smazání
  (smazání jen bez navázaných nabídek)
- ✅ Seed: Sreality.cz, Bezrealitky.cz, Reality.iDNES.cz, Reality.cz, RE/MAX,
  M&M Reality, Jiný zdroj (obecný) + České reality z dřívějška
- ✅ Ověření: Playwright E2E (30 kontrol) — URL import s lokálním OG testovacím
  serverem (titulek ✓, canonical ✓, obrázek nepřevzat ✓), manuální formulář,
  validace, externí odkazy (`noopener noreferrer` ✓), výpočet ceny/m²
  (5 000 000 / 50 m² → 100 000 Kč/m² ✓), úplnost (8/8 vysoká, 2/8 nízká ✓),
  změna stavu, uložit/porovnat, oprávnění (cizí nabídka 404, admin sekce
  nedostupná), admin CRUD zdrojů; hodnoty ověřeny i přímo v DB;
  `tsc` ✓, `eslint` ✓, `next build` ✓, `prisma migrate status` ✓

## Co zůstává (další fáze)

- AI analýza nabídky vůči profilu hledání (detail už má vyhrazené místo)
- Stránka porovnání (položky se už ukládají do `PropertyComparison`)
- Seznam uložených nemovitostí jako samostatný pohled
- Automatická kontrola stavu nabídek / cen (lastCheckedAt se zatím mění ručně)
- Platby / předplatné; vynucování `UsageLimit`
- Strukturované integrace portálů (feed/API) v adaptérech — nyní jen OG placeholdery
- i18n, CI pro E2E, reset hesla, OAuth

## Hlavní architektonická rozhodnutí

1. **`Property` vs. `PropertyListing`** — kanonická nemovitost odděleně od inzerátů;
   nabídka přidaná uživatelem vytváří obojí, `addedByUserId` určuje vlastníka záznamu.
2. **Modulární adaptéry zdrojů** s jednotným rozhraním (`matches(hostname)`,
   `fetchMetadata(url)`); registry řadí specifické adaptéry před generický fallback.
   Nové portály = nový soubor, žádné zásahy do akcí.
3. **Právní ohleduplnost jako datový model**: per-zdroj `allowPreviewImages` /
   `allowMetadataImport` řízené adminem, per-nabídka `imageUsageAllowed` zmrazené
   v okamžiku uložení; UI nikdy nezobrazí nepovolený obrázek a nekopíruje inzeráty.
4. **Úplnost dat a cena/m² se počítají na serveru při každém uložení**
   (`src/lib/listing-utils.ts`) — UI je jen zobrazuje; změna ceny zapisuje záznam
   do `PriceHistory`.
5. **Server actions + Zod** pro všechny mutace; vlastnictví se ověřuje v akcích
   (`findEditableListing`), ne v UI.

## Databázový model

17 tabulek — beze změny počtu; ve fázi 3 rozšířeno:
`PropertyListing` (+`addedByUserId`, `monthlyCosts`, `userNote`),
`Property` (+`hasLoggia`), `ListingStatus` → ACTIVE/INACTIVE/UNKNOWN/REMOVED.

Klíčové relace: `User 1—N PropertyListing (addedBy)`,
`Property 1—N PropertyListing N—1 ListingSource`, `PropertyListing 1—N PriceHistory`,
`User 1—N SavedProperty / PropertyComparison(Item)`.

## Příkazy na spuštění projektu

```bash
npm install
cp .env.example .env        # nastavte DATABASE_URL a AUTH_SECRET
npm run db:migrate          # migrace + generování klienta
npm run db:seed             # vývojová data (kraje, zdroje, uživatelé, ukázky)
npm run dev                 # http://localhost:3000
```

Testovací účty: `admin@realitycheck.local` / `admin1234` (ADMIN),
`demo@realitycheck.local` / `demo1234` (USER — má profil hledání i 2 nabídky).

Kontroly: `npm run typecheck && npm run lint && npm run build`.

## Známá omezení

- Adaptéry portálů zatím čtou jen Open Graph metadata — strukturovaný import
  (ceny, parametry) vyžaduje dohody/feed a přijde později.
- Fetch metadat následuje URL zadanou uživatelem (jen http/https); ochrana proti
  SSRF na privátní adresy zatím není implementovaná — doplnit před produkcí.
- Nabídky jsou privátní pro uživatele, který je přidal; deduplikace stejné
  nemovitosti mezi uživateli zatím neprobíhá (unikátnost jen na externí id zdroje).
- „Porovnat“ ukládá do výchozího porovnání; UI stránka porovnání přijde v další fázi.
- `lastCheckedAt` se aktualizuje jen při ruční změně — bez automatického ověřování.
- E2E test (Playwright) se spouští ručně, není v CI.
- Bez AI volání a plateb (záměr této fáze).

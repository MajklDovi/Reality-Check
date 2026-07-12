# PROJECT_STATUS

Stav k: 2026-07-12 · Fáze: **onboarding a správa profilů hledání** (fáze 2)

## Co bylo dokončeno

### Fáze 1 — technický základ

- ✅ Next.js 15 (App Router, Turbopack), TypeScript (strict), Tailwind CSS v4,
  ESLint 9, Prettier, `.env.example`
- ✅ PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`, `prisma.config.ts`)
- ✅ Autentizace (Auth.js / NextAuth v5): registrace, přihlášení, odhlášení,
  ochrana privátních stránek (middleware + layouty), role `USER` / `ADMIN`
- ✅ Komponentová knihovna, layout aplikace, stránky `/`, `/login`, `/register`,
  `/dashboard`, `/profile`, `/settings`, `/admin`

### Fáze 2 — onboarding a profily hledání

- ✅ Rozšíření datového modelu:
  - `SearchPurpose` — 8 účelů (vlastní bydlení, rodina, investice dlouhodobý/krátkodobý
    pronájem, rekreace, rekonstrukce, další prodej, pro rodiče/děti)
  - `SearchProfile` — rozpočtová pole (ideální/maximální cena, úspory, hypotéka, příjem,
    splátky, rezerva, rozpočet na rekonstrukci/zařízení), `propertyTypes[]`
    (12 typů vč. družstevního bytu, ateliéru, novostavby…), `dispositions[]` (1+kk…6+),
    `preferredCityParts[]`, `transportMode`, `isDefault`
  - `OnboardingDraft` — rozpracovaný průvodce (JSON + aktuální krok, 1 na uživatele)
  - `Region` — 14 českých krajů jako seed data
- ✅ 8krokový onboarding průvodce (`/onboarding`):
  1. účel hledání (8 možností s vysvětlením, předvyplnění názvu profilu)
  2. rozpočet (10 částek v Kč, povinná jen maximální cena, křížová validace)
  3. typ nemovitosti (multi-select 12 typů)
  4. lokalita (kraje ze seedu, města/části/vyloučené jako chips, dojíždění + doprava)
  5. velikost a dispozice (výměra, 1+kk…6+, počty pokojů, min≤max validace)
  6. vlastnosti (vlastnictví, stav, podlaží, energetická třída, 10 checkbox vybavení)
  7. životní styl (16 kritérií: MHD, školy, školky, obchody, lékaři, parky, příroda,
     sport, restaurace, kultura, ticho, parkování, děti, senioři, zvířata, dojíždění)
  8. priority (5 úrovní na kritérium; nezbytné → `isRequired` + váha 10, dále 7/4/2/0)
- ✅ UX průvodce: progress bar, krok X z 8, návrat zpět bez ztráty dat, průběžné
  ukládání draftu při přechodu mezi kroky, obnovení draftu po návratu (i po odhlášení),
  validace každého kroku s českými hláškami, vysvětlující texty, mobilní layout
- ✅ Po registraci přesměrování na `/onboarding`; dashboard nabízí „Pokračovat v profilu"
- ✅ Správa profilů:
  - `/search-profiles` — seznam s vyplněností, stavem a akcemi
  - `/search-profiles/new` — přesměruje na průvodce
  - `/search-profiles/[id]` — detail (rozpočet, nemovitost, lokalita, kritéria s prioritami)
  - `/search-profiles/[id]/edit` — stejný průvodce předvyplněný z DB
  - akce: duplikovat (kopie neaktivní), aktivovat/deaktivovat, nastavit výchozí,
    odstranit (s potvrzovacím dialogem)
- ✅ Limity plánů v `src/config/plans.ts` (konfigurovatelné, vynucované v server
  actions, ne v UI): FREE = 1 aktivní / 5 celkem, BASIC = 3/10, PREMIUM = 10/50
- ✅ Dashboard: karta aktivního profilu (hlavní parametry, vyplněnost, tlačítko úpravy),
  tlačítko „Přidat nabídku" (zatím neaktivní — další fáze), prázdné stavy
- ✅ Nové UI komponenty: `Progress`, `TagInput`
- ✅ Seed: 14 krajů, ukázkový profil s novými poli a prioritami
- ✅ Ověření: E2E test (Playwright, mobilní viewport 390×844) pokrývající registraci →
  onboarding → validace všech kroků → obnovení draftu → dokončení → detail →
  duplikaci → vynucení limitu FREE plánu; kontrola zápisů v DB (profil, preference
  s váhami a `isRequired`, smazání draftu po dokončení); `tsc` ✓, `eslint` ✓,
  `next build` ✓, `prisma migrate status` ✓

## Co zůstává (další fáze)

- Přidávání nabídek uživatelem (vložení URL, parsování metadat) — tlačítko připraveno
- Detail nemovitosti, seznam uložených nemovitostí, UI porovnání
- AI integrace (výpočet zhody nabídky s profilem) — záměrně vynecháno
- Platby / předplatné — záměrně vynecháno (limity plánů už jsou připravené)
- Automatický import z realitních portálů — záměrně vynecháno
- Vynucování `UsageLimit` (AI analýzy, uložené nemovitosti)
- i18n (UI je česky natvrdo)
- Automatizované testy v CI (E2E skript zatím spouštěn ručně)
- Reset hesla, verifikace e-mailu, OAuth provideři

## Hlavní architektonická rozhodnutí

1. **App Router + server actions** pro mutace; server components čtou data přímo
   přes Prismu. Auth.js v5 s JWT (role v tokenu), edge-safe middleware.
2. **Průvodce jako klientský stav + server autosave**: každý krok má vlastní Zod
   schéma (sdílené klientem i serverem); při přechodu mezi kroky se celý stav
   ukládá do `OnboardingDraft` (JSON). Dokončení průvodce draft validuje celým
   schématem, vytvoří profil a draft smaže. Úprava profilu používá stejný průvodce,
   jen bez draftů (data se předvyplní z DB a uloží najednou).
3. **Kritéria jako `Preference` řádky** (key/value/priority/isRequired) místo sloupců —
   katalog kritérií žije v kódu (`src/lib/search-criteria.ts`), takže přidání kritéria
   nevyžaduje migraci. Váhy: nezbytné 10 (+`isRequired`), velmi důležité 7, důležité 4,
   výhoda 2, nepodstatné 0.
4. **`Property` vs. `PropertyListing`** — kanonická nemovitost vs. inzeráty na portálech.
5. **Limity plánů konfigurovatelné** v `src/config/plans.ts`, vynucované výhradně
   v server actions (`completeOnboarding`, `setActive`, `duplicate`) — UI je jen zobrazuje.
6. **Peněžní hodnoty `Decimal(12,2)`**; pro klientské komponenty se konvertují na
   čísla přes `toPlainSearchProfile` (Decimal není serializovatelný do client props).

## Databázový model

Entity: `User`, `UserProfile`, `SearchProfile`, `Preference`, `OnboardingDraft`,
`Region`, `Property`, `PropertyListing`, `ListingSource`, `PriceHistory`,
`SavedProperty`, `PropertyComparison`, `PropertyComparisonItem`, `AIAnalysis`,
`RiskFlag`, `Subscription`, `UsageLimit` (17 tabulek).

`SearchProfile` (jádro této fáze): účel (`SearchPurpose`), 11 rozpočtových polí
(Decimal, Kč), `propertyTypes DesiredPropertyType[]`, `dispositions Disposition[]`,
výměry/pokoje, lokalita (kraje, města, městské části, vyloučené, dojíždění,
`TransportMode`), `isActive`, `isDefault`, 1—N `Preference`
(key/value, priority 0–10, `isRequired`).

`OnboardingDraft`: `userId` (unique), `currentStep`, `data Json`.
`Region`: název + kód kraje, seedováno 14 českých krajů.

Enumy: `Role`, `SearchPurpose` (8), `DesiredPropertyType` (12), `TransportMode` (4),
`PropertyType`, `Disposition`, `OwnershipType`, `PropertyCondition`, `EnergyClass`,
`ConstructionType`, `SellerType`, `ListingStatus`, `IntegrationType`, `RiskSeverity`,
`SubscriptionPlan`, `SubscriptionStatus`.

## Příkazy na spuštění projektu

```bash
npm install
cp .env.example .env        # nastavte DATABASE_URL a AUTH_SECRET
npm run db:migrate          # migrace + generování klienta
npm run db:seed             # vývojová data (kraje, uživatelé, ukázkový profil)
npm run dev                 # http://localhost:3000
```

Testovací účty: `admin@realitycheck.local` / `admin1234` (ADMIN),
`demo@realitycheck.local` / `demo1234` (USER, má vyplněný profil hledání).

Kontroly: `npm run typecheck && npm run lint && npm run build`.

## Známá omezení

- Bez AI analýzy, plateb a automatického importu portálů (záměr).
- Draft se ukládá při přechodu mezi kroky — rozepsané hodnoty uvnitř právě
  otevřeného kroku se do draftu zapíší až po kliknutí na Pokračovat/Zpět.
- Jeden draft na uživatele; úprava existujícího profilu drafty nepoužívá
  (uloží se až po dokončení průvodce).
- „Přidat nabídku" na dashboardu je zatím neaktivní tlačítko (další fáze).
- `UsageLimit`/`Subscription` se vynucují jen pro počty profilů, ne pro AI analýzy.
- UI česky natvrdo; `language` se zatím jen ukládá.
- E2E test (Playwright) běží ručně, není součástí CI.

# PROJECT_STATUS

Stav k: 2026-07-12 · Fáze: **technický základ projektu**

## Co bylo dokončeno

- ✅ Inicializace projektu: Next.js 15 (App Router, Turbopack), TypeScript (strict),
  Tailwind CSS v4, ESLint 9, Prettier (+ Tailwind plugin), `.env.example`
- ✅ PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`, `prisma.config.ts`),
  úvodní migrace aplikovaná a ověřená (`prisma migrate status`)
- ✅ Kompletní databázový model — všech 15 požadovaných entit + enumy (viz níže)
- ✅ Autentizace (Auth.js / NextAuth v5):
  - registrace (server action + bcrypt hash, automatické přihlášení)
  - přihlášení / odhlášení (credentials provider, JWT session)
  - ochrana privátních stránek (middleware + serverové layouty)
  - role `USER` a `ADMIN`, role v JWT tokenu i session
- ✅ Layout aplikace: veřejná navigace, navigace pro přihlášeného uživatele,
  uživatelské menu (dropdown s odhlášením), mobilní menu, footer
- ✅ Komponentová knihovna (`src/components/ui`): Button, Input, Select, Checkbox,
  RadioGroup, Slider, Card, Badge, Modal, Tabs, Alert, EmptyState, LoadingState
- ✅ Stránky: `/`, `/login`, `/register`, `/dashboard`, `/profile`, `/settings`, `/admin`
- ✅ Ochrana admin sekce (middleware + `admin/layout.tsx`, redirect ne-adminů)
- ✅ Funkční formuláře nad RHF + Zod: registrace, přihlášení, finanční profil,
  nastavení účtu (jméno, jazyk) — vše přes server actions se serverovou validací
- ✅ Seed data: 2 uživatelé (admin + demo), 4 zdroje inzerátů, 2 nemovitosti
  s inzeráty a cenovou historií, vyhledávací profil s preferencemi, uložené
  nemovitosti, porovnání, 2 AI analýzy s rizikovými flagy, subscription, usage limit
- ✅ Ověření: `tsc --noEmit` ✓, `eslint` ✓ (0 chyb), `next build` ✓,
  migrace ✓, seed ✓, smoke test přihlášení/rolí přes HTTP ✓

## Co zůstává (další fáze)

- Přidávání nabídek uživatelem (vložení URL, parsování metadat) — zatím jen datový model
- CRUD vyhledávacích profilů a preferencí v UI
- Detail nemovitosti, seznam uložených nemovitostí, UI porovnání
- AI integrace (generování analýz) — záměrně vynecháno v této fázi
- Platby / předplatné (Stripe apod.) — záměrně vynecháno
- Automatický import z realitních portálů — záměrně vynecháno
- Vynucování usage limitů dle plánu
- i18n (pole `language` existuje, UI je zatím česky natvrdo)
- Testy (unit/E2E) a CI pipeline
- Reset hesla, verifikace e-mailu, případně OAuth provideři

## Hlavní architektonická rozhodnutí

1. **App Router + server actions** pro mutace (auth, profil); API routes jen pro
   Auth.js handler. Server components čtou data přímo přes Prismu.
2. **Auth.js v5 s JWT strategií** — credentials provider (bcrypt), role uložená
   v tokenu. Konfigurace rozdělená na edge-safe `auth.config.ts` (middleware)
   a plnou `auth.ts` (Prisma). Dvouvrstvá ochrana: middleware + serverové layouty.
3. **`Property` oddělená od `PropertyListing`** — nemovitost je kanonická entita,
   inzeráty jsou její výskyty na portálech (`ListingSource`), s `PriceHistory`.
   Umožňuje deduplikaci a porovnání téže nemovitosti napříč portály.
4. **Právní ohleduplnost v datech**: per-zdroj příznaky `allowPreviewImages`
   a `allowMetadataImport`, per-inzerát `imageUsageAllowed` — aplikace nikdy
   nepublikuje celé cizí inzeráty, jen metadata + odkaz.
5. **Prisma 7** s novým `prisma-client` generátorem (výstup v `src/generated/prisma`,
   mimo git) a pg driver adapterem; connection string v `prisma.config.ts` / `.env`.
6. **Zod schémata sdílená** mezi klientskými formuláři (RHF resolver) a server
   actions — validace vždy i na serveru.
7. **Peněžní hodnoty jako `Decimal(12,2)`**, skóre AI analýz 0–100 (Int),
   `dataConfidence`/`dataCompleteness` 0–1 (Float).

## Databázový model

Entity (tabulky mapované přes `@@map` na snake_case):

| Entita                   | Účel                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `User`                   | účet, e-mail, bcrypt hash / externí auth id, role, jazyk                                                            |
| `UserProfile`            | 1:1 finanční možnosti (příjem, úspory, max. splátka)                                                                |
| `SearchProfile`          | pojmenované hledání: cena min/ideál/max, plocha, dispozice, lokality, dojíždění                                     |
| `Preference`             | key/value preference profilu s prioritou a `isRequired`                                                             |
| `Property`               | kanonická nemovitost (typ, dispozice, lokalita, GPS, stav, vybavení, energetika)                                    |
| `PropertyListing`        | inzerát na portálu: URL, cena, prodejce, stav, kompletnost dat, práva k obrázku                                     |
| `ListingSource`          | portál (Sreality, …): typ integrace, povolení importu/obrázků                                                       |
| `PriceHistory`           | časová řada cen inzerátu                                                                                            |
| `SavedProperty`          | uložená nemovitost uživatele + poznámka                                                                             |
| `PropertyComparison`     | pojmenované porovnání                                                                                               |
| `PropertyComparisonItem` | položka porovnání s pozicí                                                                                          |
| `AIAnalysis`             | skóre (celkové, finanční, požadavky, lokalita, cena, stav), souhrn, silné/slabé stránky, kompromisy, chybějící info |
| `RiskFlag`               | riziko analýzy: typ, závažnost, doporučení                                                                          |
| `Subscription`           | plán (FREE/BASIC/PREMIUM), status, období                                                                           |
| `UsageLimit`             | čerpání limitů za období (AI analýzy, uložené nemovitosti)                                                          |

Enumy: `Role`, `SearchPurpose`, `PropertyType`, `Disposition` (1+kk … 6+),
`OwnershipType`, `PropertyCondition`, `EnergyClass`, `ConstructionType`,
`SellerType`, `ListingStatus`, `IntegrationType`, `RiskSeverity`,
`SubscriptionPlan`, `SubscriptionStatus`.

Klíčové relace: `User 1—1 UserProfile`, `User 1—N SearchProfile 1—N Preference`,
`Property 1—N PropertyListing N—1 ListingSource`, `PropertyListing 1—N PriceHistory`,
`AIAnalysis N—1 (User, Property, SearchProfile?) 1—N RiskFlag`.

## Příkazy na spuštění projektu

```bash
npm install
cp .env.example .env        # nastavte DATABASE_URL a AUTH_SECRET
npm run db:migrate          # migrace + generování klienta
npm run db:seed             # vývojová data
npm run dev                 # http://localhost:3000
```

Testovací účty: `admin@realitycheck.local` / `admin1234` (ADMIN),
`demo@realitycheck.local` / `demo1234` (USER).

Kontroly: `npm run typecheck && npm run lint && npm run build`.

## Známá omezení

- Bez AI integrace, plateb a automatického importu portálů (záměr této fáze).
- Seed AI analýzy jsou ilustrační statická data, ne výstup modelu.
- Přihlášení pouze e-mail+heslo; chybí reset hesla a verifikace e-mailu.
- UI texty česky natvrdo (bez i18n vrstvy), `language` se zatím jen ukládá.
- Dashboard zobrazuje jen počty; detailní výpisy nemovitostí přijdou s další fází.
- Žádné automatizované testy; ověřeno typecheckem, lintem, buildem a manuálním
  HTTP smoke testem.
- `Subscription`/`UsageLimit` se nikde nevynucují — pouze datový model.

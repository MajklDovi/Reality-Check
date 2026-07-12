# Reality Check

Webová SaaS aplikace pro český realitní trh — „Heureka pro nemovitosti“.

Aplikace nezveřejňuje cizí inzeráty. Zobrazuje základní údaje o nemovitostech, vlastní
analytické výsledky (AI hodnocení shody, ceny, lokality, rizik a celkových nákladů)
a odkazy na původní nabídky na externích portálech.

## Technologický stack

| Vrstva        | Technologie                                       |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 15 (App Router, Turbopack)                |
| Jazyk         | TypeScript (strict)                               |
| Styly         | Tailwind CSS v4                                   |
| Databáze      | PostgreSQL                                        |
| ORM           | Prisma 7 (driver adapter `@prisma/adapter-pg`)    |
| Autentizace   | Auth.js / NextAuth v5 (credentials, JWT sessions) |
| Validace      | Zod v4                                            |
| Formuláře     | React Hook Form + `@hookform/resolvers`           |
| Lint / Format | ESLint 9 + Prettier (s Tailwind pluginem)         |

## Rychlý start

```bash
# 1. Závislosti
npm install

# 2. Environment
cp .env.example .env   # a upravte DATABASE_URL + AUTH_SECRET

# 3. Databáze (PostgreSQL musí běžet)
npm run db:migrate     # aplikuje migrace + vygeneruje Prisma klient
npm run db:seed        # naplní vývojová data

# 4. Vývojový server
npm run dev            # http://localhost:3000
```

### Testovací účty (ze seedu)

| Účet                       | Heslo       | Role  |
| -------------------------- | ----------- | ----- |
| `admin@realitycheck.local` | `admin1234` | ADMIN |
| `demo@realitycheck.local`  | `demo1234`  | USER  |

## Architektura

```
prisma/
  schema.prisma        # kompletní databázový model (17 entit + enumy)
  seed.ts              # vývojová data (uživatelé, kraje, zdroje, ukázkový profil)
  migrations/          # SQL migrace
prisma.config.ts       # Prisma 7 konfigurace (datasource URL, seed příkaz)
src/
  app/                 # App Router
    page.tsx           # veřejná landing page
    login/ register/   # veřejné auth stránky
    (protected)/       # skupina chráněných stránek (layout ověřuje session)
      dashboard/       # přehled: aktivní profil, statistiky, sledované nabídky
      onboarding/      # 8krokový průvodce vytvořením profilu hledání
      search-profiles/ # správa profilů: seznam, new, [id], [id]/edit
      properties/      # externí nabídky: seznam, new (URL/ručně), [id], [id]/edit
      profile/ settings/
      admin/           # vlastní layout ověřuje roli ADMIN; sources/ = správa zdrojů
    api/auth/[...nextauth]/  # Auth.js route handler
  actions/             # server actions (auth, profil, search-profile, listing, sources)
  components/
    ui/                # znovupoužitelné komponenty (Button, Input, Modal, Progress, TagInput, …)
    layout/            # Header, Footer, UserMenu, MobileNav
    auth/ profile/ settings/    # formuláře k jednotlivým doménám
    search-profile-wizard/      # onboarding průvodce + jednotlivé kroky
    search-profiles/            # akce správy profilů (duplikace, aktivace, smazání)
    listings/                   # karta nabídky, formulář, URL import, náhled/placeholder
    admin/                      # správa zdrojů inzerátů
  config/
    plans.ts           # konfigurovatelné limity předplatných (počet profilů)
  lib/
    auth.ts            # NextAuth konfigurace s Credentials providerem
    auth.config.ts     # edge-safe část konfigurace (sdílená s middlewarem)
    prisma.ts          # PrismaClient singleton (pg driver adapter)
    search-criteria.ts # katalog kritérií (vlastnosti, životní styl) + české popisky
    search-profile-utils.ts  # kompletnost profilu, mapování wizard ↔ DB, formátování Kč
    listing-utils.ts   # úplnost dat nabídky, cena/m², pravidla náhledových obrázků
    property-labels.ts # české popisky enumů nemovitostí
    source-adapters/   # modulární adaptéry zdrojů (generic OG, Sreality, Bezrealitky, …)
    validations/       # Zod schémata (auth, profil, kroky průvodce)
  generated/prisma/    # generovaný Prisma klient (mimo git)
  middleware.ts        # ochrana privátních tras + admin sekce
  types/next-auth.d.ts # rozšíření session o id a roli
```

### Onboarding a profily hledání

Po registraci je uživatel přesměrován na `/onboarding` — 8krokového průvodce
(účel → rozpočet → typ nemovitosti → lokalita → velikost a dispozice → vlastnosti →
životní styl → priority). Průvodce průběžně ukládá rozpracovaná data do
`OnboardingDraft`, takže po odchodu lze pokračovat tam, kde uživatel skončil.
Každý krok je validován Zodem (klient i server sdílejí stejná schémata).

Kritéria z kroků 6–7 se ukládají jako `Preference` řádky; v kroku 8 jim uživatel
přiřazuje úrovně: nezbytné (`isRequired`, váha 10), velmi důležité (7), důležité (4),
výhoda navíc (2), nepodstatné (0).

Správa profilů na `/search-profiles`: vytvoření, úprava (stejný průvodce s předvyplněnými
daty), duplikace, aktivace/deaktivace, výchozí profil, smazání. Limity počtu profilů jsou
konfigurovatelné per plán v `src/config/plans.ts` a vynucují se v server actions (FREE:
1 aktivní profil).

### Externí nabídky

Nabídku lze přidat vložením URL inzerátu, nebo ručně (`/properties/new`). Při vložení
URL systém identifikuje portál podle domény (`ListingSource`), a pokud to zdroj povoluje
(`allowMetadataImport`), načte přes modulární adaptér základní Open Graph metadata —
titulek, canonical URL a náhledový obrázek (jen při `allowPreviewImages`). Jde o jediný
zdvořilý požadavek s timeoutem a limitem velikosti, žádný agresivní scraping. Načtená
data uživatel zkontroluje a doplní ve formuláři.

Aplikace nikdy nekopíruje celé inzeráty — ukládá jen základní parametry, vlastní
poznámky a odkaz na původní zdroj (otevíraný s `noopener noreferrer`). Náhledový
obrázek se zobrazuje pouze z povolených metadat nebo po ručním vložení uživatelem;
jinak se ukazuje neutrální placeholder podle typu nemovitosti. Externí obrázky se
neukládají lokálně.

Cena za m² se dopočítává automaticky; úplnost dat (0–100 %) se počítá z 8 klíčových
polí (cena, výměra, lokalita, typ, dispozice, vlastnictví, stav, zdrojový odkaz) a
zobrazuje se jako vysoká / střední / nízká. Stavy nabídky: ACTIVE, INACTIVE, UNKNOWN,
REMOVED — uživatel je může měnit ručně. Správa zdrojů (domény, integrace, povolení
náhledů a metadat) je v administraci na `/admin/sources`.

### Klíčová rozhodnutí

- **Autentizace**: credentials provider s bcrypt hashem, JWT session (role uživatele je
  součástí tokenu). Middleware používá edge-safe `auth.config.ts` bez Prismy; chráněné
  layouty provádějí druhou serverovou kontrolu.
- **Mutace přes server actions** (`src/actions/`), vstupy vždy validované Zodem na serveru;
  formuláře používají tatáž schémata přes React Hook Form.
- **Datový model odděluje nemovitost (`Property`) od inzerátu (`PropertyListing`)** — jedna
  nemovitost může mít nabídky na více portálech (`ListingSource`), s historií cen.
- **Respekt ke zdrojům dat**: `ListingSource.allowPreviewImages` / `allowMetadataImport`
  a `PropertyListing.imageUsageAllowed` řídí, co smíme ze zdroje zobrazit.

## Příkazy

| Příkaz               | Popis                            |
| -------------------- | -------------------------------- |
| `npm run dev`        | vývojový server                  |
| `npm run build`      | produkční build                  |
| `npm run start`      | produkční server                 |
| `npm run lint`       | ESLint                           |
| `npm run typecheck`  | TypeScript kontrola              |
| `npm run format`     | Prettier                         |
| `npm run db:migrate` | vytvoření/aplikace migrací (dev) |
| `npm run db:deploy`  | aplikace migrací (produkce)      |
| `npm run db:seed`    | seed vývojových dat              |
| `npm run db:studio`  | Prisma Studio                    |

Aktuální stav projektu a plán najdete v [PROJECT_STATUS.md](./PROJECT_STATUS.md).

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
  schema.prisma        # kompletní databázový model (15 entit + enumy)
  seed.ts              # vývojová data
  migrations/          # SQL migrace
prisma.config.ts       # Prisma 7 konfigurace (datasource URL, seed příkaz)
src/
  app/                 # App Router
    page.tsx           # veřejná landing page
    login/ register/   # veřejné auth stránky
    (protected)/       # skupina chráněných stránek (layout ověřuje session)
      dashboard/ profile/ settings/
      admin/           # vlastní layout ověřuje roli ADMIN
    api/auth/[...nextauth]/  # Auth.js route handler
  actions/             # server actions (auth, profil) — mutace dat
  components/
    ui/                # znovupoužitelné komponenty (Button, Input, Modal, …)
    layout/            # Header, Footer, UserMenu, MobileNav
    auth/ profile/ settings/  # formuláře k jednotlivým doménám
  lib/
    auth.ts            # NextAuth konfigurace s Credentials providerem
    auth.config.ts     # edge-safe část konfigurace (sdílená s middlewarem)
    prisma.ts          # PrismaClient singleton (pg driver adapter)
    validations/       # Zod schémata
  generated/prisma/    # generovaný Prisma klient (mimo git)
  middleware.ts        # ochrana privátních tras + admin sekce
  types/next-auth.d.ts # rozšíření session o id a roli
```

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

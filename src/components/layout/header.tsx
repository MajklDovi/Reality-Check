import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

const publicLinks = [
  { href: "/#funkce", label: "Funkce" },
  { href: "/#jak-to-funguje", label: "Jak to funguje" },
];

const appLinks = [
  { href: "/dashboard", label: "Přehled" },
  { href: "/search-profiles", label: "Profily hledání" },
  { href: "/profile", label: "Můj profil" },
];

export async function Header() {
  const session = await auth();
  const user = session?.user;
  const links = user ? appLinks : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              RC
            </span>
            <span className="text-zinc-900 dark:text-zinc-50">Reality Check</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu
              name={user.name ?? user.email ?? "Uživatel"}
              email={user.email ?? ""}
              isAdmin={user.role === "ADMIN"}
            />
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Přihlásit se
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrovat se</Button>
              </Link>
            </div>
          )}
          <MobileNav links={links} isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex size-6 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">
            RC
          </span>
          <span>© {new Date().getFullYear()} Reality Check. Srovnávač nemovitostí s AI.</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Úvod
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Přihlášení
          </Link>
          <Link
            href="/register"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Registrace
          </Link>
        </nav>
      </div>
    </footer>
  );
}

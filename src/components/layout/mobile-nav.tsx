"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

export interface MobileNavProps {
  links: { href: string; label: string }[];
  isLoggedIn: boolean;
}

export function MobileNav({ links, isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Zavřít menu" : "Otevřít menu"}
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-zinc-200 bg-white p-4 shadow-lg md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {!isLoggedIn && (
            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Přihlásit se
                </Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button className="w-full">Registrovat se</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

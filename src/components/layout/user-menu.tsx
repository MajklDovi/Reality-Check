"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

export interface UserMenuProps {
  name: string;
  email: string;
  isAdmin: boolean;
}

const menuLinks = [
  { href: "/dashboard", label: "Přehled" },
  { href: "/properties", label: "Nabídky" },
  { href: "/search-profiles", label: "Profily hledání" },
  { href: "/profile", label: "Můj profil" },
  { href: "/settings", label: "Nastavení" },
];

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initial = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {initial}
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
          open ? "block" : "hidden"
        )}
      >
        <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
        </div>
        <div className="py-1">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Administrace
            </Link>
          )}
        </div>
        <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Odhlásit se
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { NewListingFlow } from "@/components/listings/new-listing-flow";

export const metadata: Metadata = {
  title: "Přidat nabídku",
};

export default async function NewPropertyPage() {
  const [sources, regions] = await Promise.all([
    prisma.listingSource.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Přidat nabídku</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Vložte URL inzerátu, nebo vyplňte údaje ručně. Ukládáme jen základní parametry a odkaz na
          původní zdroj — celý inzerát nekopírujeme.
        </p>
      </div>
      <NewListingFlow sources={sources} regions={regions.map((r) => r.name)} />
    </div>
  );
}

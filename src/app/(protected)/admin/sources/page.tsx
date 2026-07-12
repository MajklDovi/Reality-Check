import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SourceManager } from "@/components/admin/source-manager";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Správa zdrojů",
};

export default async function AdminSourcesPage() {
  const sources = await prisma.listingSource.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Správa zdrojů</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Realitní portály a kanceláře, ze kterých uživatelé přidávají nabídky. Zde se řídí, co
            smí aplikace ze zdroje přebírat.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            ← Administrace
          </Button>
        </Link>
      </div>

      <SourceManager
        sources={sources.map((source) => ({
          id: source.id,
          name: source.name,
          domain: source.domain,
          logoUrl: source.logoUrl,
          integrationType: source.integrationType,
          isActive: source.isActive,
          allowPreviewImages: source.allowPreviewImages,
          allowMetadataImport: source.allowMetadataImport,
          listingCount: source._count.listings,
        }))}
      />
    </div>
  );
}

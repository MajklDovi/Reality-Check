"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteListingAction, setListingStatusAction } from "@/actions/listing";
import type { ListingStatus } from "@/generated/prisma/enums";
import { LISTING_STATUSES } from "@/lib/property-labels";
import { Alert, Button, Modal, Select } from "@/components/ui";

export interface ListingDetailActionsProps {
  listingId: string;
  currentStatus: ListingStatus;
  listingTitle: string;
}

export function ListingDetailActions({
  listingId,
  currentStatus,
  listingTitle,
}: ListingDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ListingStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const applyStatus = (next: ListingStatus) => {
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await setListingStatusAction(listingId, next);
      if (!result.success) {
        setError(result.error);
        setStatus(currentStatus);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    startTransition(async () => {
      const result = await deleteListingAction(listingId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/properties");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Select
            label="Stav nabídky"
            value={status}
            disabled={isPending}
            onChange={(e) => applyStatus(e.target.value as ListingStatus)}
            options={LISTING_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirmDelete(true)}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Odstranit nabídku
        </Button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Odstranit nabídku?"
        description={`Nabídka „${listingTitle}" bude odstraněna z vaší evidence včetně historie cen. Původní inzerát na portálu zůstává nedotčen.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Zrušit
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isPending}>
              Odstranit
            </Button>
          </>
        }
      />
    </div>
  );
}

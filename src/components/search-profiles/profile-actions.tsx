"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteSearchProfileAction,
  duplicateSearchProfileAction,
  setDefaultSearchProfileAction,
  setSearchProfileActiveAction,
} from "@/actions/search-profile";
import { Alert, Button, Modal } from "@/components/ui";

export interface ProfileActionsProps {
  profileId: string;
  profileName: string;
  isActive: boolean;
  isDefault: boolean;
  /** After deletion there is nothing to stay on — go back to the list. */
  redirectAfterDelete?: boolean;
}

export function ProfileActions({
  profileId,
  profileName,
  isActive,
  isDefault,
  redirectAfterDelete = false,
}: ProfileActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (action: () => Promise<{ success: boolean; error?: string; info?: string }>) => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Akce se nezdařila");
      } else {
        if (result.info) setInfo(result.info);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    setError(null);
    startTransition(async () => {
      const result = await deleteSearchProfileAction(profileId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (redirectAfterDelete) {
        router.push("/search-profiles");
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!isDefault && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => run(() => setDefaultSearchProfileAction(profileId))}
          >
            Nastavit jako výchozí
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => setSearchProfileActiveAction(profileId, !isActive))}
        >
          {isActive ? "Deaktivovat" : "Aktivovat"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => duplicateSearchProfileAction(profileId))}
        >
          Duplikovat
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirmDelete(true)}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Odstranit
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {info && <Alert variant="info">{info}</Alert>}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Odstranit profil?"
        description={`Profil „${profileName}" a všechna jeho kritéria budou trvale odstraněny. Tuto akci nelze vrátit.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Zrušit
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isPending}>
              Odstranit profil
            </Button>
          </>
        }
      />
    </div>
  );
}

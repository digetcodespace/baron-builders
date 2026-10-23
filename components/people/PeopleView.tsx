"use client";

import { useState } from "react";
import { Avatar, Button, DataTable, EmptyState, PageHeader, Skeleton, StatusPill, type Column } from "@/components/ui";
import type { ProfileRow, UserRole } from "@/lib/data";
import { usePeopleList } from "@/hooks/usePeopleList";
import { InviteDialog } from "./InviteDialog";

const ROLE_PILL: Record<UserRole, { tone: "brand" | "info" | "neutral"; label: string }> = {
  staff: { tone: "brand", label: "Staff" },
  buyer: { tone: "info", label: "Buyer" },
  vendor: { tone: "neutral", label: "Vendor" },
};

const COLUMNS: Column<ProfileRow>[] = [
  {
    id: "name",
    header: "Person",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.full_name || p.email} />
        <div className="min-w-0">
          <p className="font-semibold">{p.full_name || "No name yet"}</p>
          <p className="t-small">{p.email}</p>
        </div>
      </div>
    ),
  },
  { id: "role", header: "Role", cell: (p) => <StatusPill tone={ROLE_PILL[p.role].tone}>{ROLE_PILL[p.role].label}</StatusPill> },
  {
    id: "joined",
    header: "Added",
    align: "right",
    cell: (p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
];

/** Everyone with an account, with the button that adds more. */
export function PeopleView() {
  const [inviting, setInviting] = useState(false);
  const { items, isLoading, hasMore, sentinelRef, reload } = usePeopleList();

  return (
    <>
      <PageHeader
        title="People"
        actions={
          <Button leftIcon="plus" onClick={() => setInviting(true)}>
            Invite someone
          </Button>
        }
      />
      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="users"
          title="No one here yet"
          action={<Button onClick={() => setInviting(true)}>Invite someone</Button>}
        />
      ) : (
        <>
          <DataTable caption="People" columns={COLUMNS} rows={items} rowKey={(p) => p.id} loading={isLoading && items.length === 0} />
          {isLoading && items.length > 0 ? <Skeleton className="mt-3 h-14" /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
        </>
      )}
      <InviteDialog open={inviting} onClose={() => setInviting(false)} onInvited={reload} />
    </>
  );
}

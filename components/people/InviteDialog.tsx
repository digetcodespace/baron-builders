"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, IconButton, Modal, SegmentedControl, SelectField, TextField, EmptyState } from "@/components/ui";
import { useToast } from "@/components/providers";
import { useInvite, useInviteTargets, type InviteOutcome } from "@/hooks/useInvite";

type Role = "staff" | "buyer" | "vendor";

const ROLE_HELP: Record<Role, string> = {
  staff: "Sees every project and house, and sets everything up.",
  buyer: "Sees only their own house and fills out its selection sheets.",
  vendor: "Sees only houses where an item for their trade is open.",
};

export interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful invite so the list can refresh. */
  onInvited: () => void;
}

/** Invite a staff member, a buyer (tied to a house), or a vendor person (tied to a company). */
export function InviteDialog({ open, onClose, onInvited }: InviteDialogProps) {
  const { addToast } = useToast();
  const { submit, busy, fieldErrors, clearErrors } = useInvite();
  const targets = useInviteTargets(open);
  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [houseId, setHouseId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<(InviteOutcome & { email: string }) | null>(null);

  // Start fresh each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setRole("buyer");
      setFullName("");
      setEmail("");
      setHouseId(null);
      setVendorId(null);
      setOutcome(null);
      clearErrors();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, clearErrors]);

  const houseOptions = useMemo(
    () => targets.houses.map((h) => ({ value: h.id, label: `Lot ${h.lot}`, description: h.address ?? undefined })),
    [targets.houses],
  );
  const vendorOptions = useMemo(() => targets.vendors.map((v) => ({ value: v.id, label: v.name })), [targets.vendors]);

  const send = async () => {
    const result = await submit({
      email,
      fullName,
      role,
      houseId: role === "buyer" ? (houseId ?? undefined) : undefined,
      vendorId: role === "vendor" ? (vendorId ?? undefined) : undefined,
    });
    if (!result) return;
    setOutcome({ ...result, email });
    onInvited();
    if (result.emailSent) addToast(`Invitation sent to ${email}`, { tone: "ok" });
  };

  if (outcome) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={outcome.created ? "Account created" : "Already had an account"}
        description={
          outcome.emailSent
            ? `We emailed ${outcome.email} how to sign in.`
            : "Email is not set up yet, so nothing was sent. Share this sign-in link with them yourself."
        }
        size="sm"
        footer={<Button onClick={onClose}>Done</Button>}
      >
        {!outcome.emailSent ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-n-50 py-2 pl-3.5 pr-2">
            <p className="min-w-0 flex-1 truncate t-small text-text!">{outcome.signInUrl}</p>
            <IconButton
              label="Copy link"
              icon="copy"
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(outcome.signInUrl);
                addToast("Link copied", { tone: "ok" });
              }}
            />
          </div>
        ) : (
          <p className="t-body">They enter their email on the sign-in page and we send a one-time code each time. There is no password.</p>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite someone"
      dismissible={!busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void send()} loading={busy} rightIcon="send">
            Send invite
          </Button>
        </>
      }
    >
      <div className="space-y-5 py-2">
        <div>
          <SegmentedControl
            label="Role"
            value={role}
            onChange={(next) => {
              setRole(next as Role);
              clearErrors();
            }}
            options={[
              { value: "buyer", label: "Buyer" },
              { value: "vendor", label: "Vendor" },
              { value: "staff", label: "Staff" },
            ]}
          />
          <p className="mt-2 t-small">{ROLE_HELP[role]}</p>
        </div>
        <TextField label="Full name" value={fullName} error={fieldErrors.fullName} onChange={(e) => setFullName(e.target.value)} data-autofocus />
        <TextField
          label="Email address"
          type="email"
          leadingIcon="mail"
          value={email}
          error={fieldErrors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {role === "buyer" ? (
          houseOptions.length === 0 && !targets.loading ? (
            <EmptyState icon="home" title="No houses yet" />
          ) : (
            <SelectField
              label="House"
              searchable
              options={houseOptions}
              value={houseId}
              error={fieldErrors.houseId}
              onChange={setHouseId}
              hint="The only house this buyer will be able to see."
            />
          )
        ) : null}
        {role === "vendor" ? (
          vendorOptions.length === 0 && !targets.loading ? (
            <EmptyState icon="building" title="No vendors yet" />
          ) : (
            <SelectField
              label="Vendor company"
              searchable
              options={vendorOptions}
              value={vendorId}
              error={fieldErrors.vendorId}
              onChange={setVendorId}
              hint="They will only see houses with an open item for this company."
            />
          )
        ) : null}
      </div>
    </Modal>
  );
}

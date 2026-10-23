"use client";

import { useState } from "react";
import {
  Accordion,
  Avatar,
  AvatarGroup,
  Breadcrumbs,
  Button,
  Calendar,
  Card,
  CardFooter,
  CardHeader,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  Divider,
  Drawer,
  IconButton,
  Menu,
  Modal,
  Money,
  Popover,
  StatCard,
  StatusPill,
  Stepper,
  Tabs,
  Tag,
  TextField,
  Timeline,
  type Column,
  type SortState,
} from "@/components/ui";
import { useToast } from "@/components/providers";
import { Grid, Row, Section, Specimen } from "./GalleryParts";

interface HouseRow {
  id: string;
  lot: string;
  address: string;
  model: string;
  status: "ok" | "info" | "warn";
  statusLabel: string;
  total: number;
}

const HOUSES: HouseRow[] = [
  { id: "1", lot: "Lot 1", address: "12 Beaver Crossing", model: "A-34 Corner", status: "ok", statusLabel: "Signed", total: 21450000 },
  { id: "2", lot: "Lot 2", address: "14 Beaver Crossing", model: "A-34 Middle", status: "info", statusLabel: "In progress", total: 18920000 },
  { id: "3", lot: "Lot 3", address: "16 Beaver Crossing", model: "A-34 Middle", status: "warn", statusLabel: "Due in 2 days", total: 19275000 },
  { id: "4", lot: "Lot 4", address: "18 Beaver Crossing", model: "A-34 Corner", status: "ok", statusLabel: "Signed", total: 22100000 },
];

export function OverlaysSection() {
  const { addToast } = useToast();
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState<"right" | "bottom" | null>(null);
  const [busy, setBusy] = useState(false);
  const [day, setDay] = useState<string | null>("2026-11-14");

  return (
    <Section id="overlays" title="Overlays" blurb="Dialogs spring up over a blurred backdrop, trap focus, and give it back on close. Menus and popovers flip above when there is no room below.">
      <Grid>
        <Specimen name="Modal and confirm dialog">
          <Row>
            <Button variant="secondary" onClick={() => setModal(true)}>Open modal</Button>
            <Button variant="danger" leftIcon="trash" onClick={() => setConfirm(true)}>Delete project</Button>
          </Row>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="Add a vendor"
            description="Vendors are set up by trade. Which company covers each trade is chosen per project."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                <Button onClick={() => { setModal(false); addToast("Vendor added", { tone: "ok" }); }}>Add vendor</Button>
              </>
            }
          >
            <div className="space-y-4 py-2">
              <TextField label="Company name" data-autofocus />
              <TextField label="Contact email" type="email" leadingIcon="mail" />
            </div>
          </Modal>
          <ConfirmDialog
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Delete Beaver Crossing?"
            description="This removes the project, its models, and its sheets. Houses with a signed sheet cannot be deleted."
            confirmLabel="Delete project"
            destructive
            loading={busy}
            onConfirm={() => {
              setBusy(true);
              window.setTimeout(() => {
                setBusy(false);
                setConfirm(false);
                addToast("Project deleted", { tone: "ok" });
              }, 1200);
            }}
          />
        </Specimen>
        <Specimen name="Drawers" note="a side panel, and a bottom sheet for phones">
          <Row>
            <Button variant="secondary" rightIcon="arrow-right" onClick={() => setDrawer("right")}>House file</Button>
            <Button variant="secondary" onClick={() => setDrawer("bottom")}>Bottom sheet</Button>
          </Row>
          <Drawer
            open={drawer !== null}
            side={drawer ?? "right"}
            onClose={() => setDrawer(null)}
            title="Lot 12 · 14 Beaver Crossing"
            description="Model A-34 Middle"
            footer={<Button onClick={() => setDrawer(null)}>Done</Button>}
          >
            <DescriptionList items={[{ term: "Status", value: <StatusPill tone="info">Finishes</StatusPill> }, { term: "Buyers", value: "Maria & Daniel Hernandez" }, { term: "Sheet total", value: <Money cents={1892000} /> }]} />
          </Drawer>
        </Specimen>
      </Grid>
      <Grid>
        <div className="space-y-6">
          <Specimen name="Menu" note="arrow keys + Enter">
          <Menu
            label="House actions"
            items={[
              { id: "open", label: "Open house file", icon: "eye", onSelect: () => addToast("Opening…") },
              { id: "edit", label: "Edit details", icon: "pencil", onSelect: () => addToast("Editing…") },
              { id: "email", label: "Email buyers", icon: "mail", onSelect: () => addToast("Email drafted", { tone: "ok" }) },
              { id: "delete", label: "Delete house", icon: "trash", destructive: true, separated: true, onSelect: () => addToast("Can't delete a signed house", { tone: "bad" }) },
            ]}
            trigger={(props) => (
              <Button {...props} variant="secondary" rightIcon="chevron-down">Actions</Button>
            )}
          />
        </Specimen>
          <Specimen name="Popover">
          <Popover
            label="Filters"
            trigger={(props) => <Button {...props} variant="secondary" leftIcon="filter">Filters</Button>}
          >
            {(close) => (
              <div className="w-64 space-y-3">
                <p className="t-ui font-semibold">Filter houses</p>
                <Row><Tag tone="brand" onRemove={() => undefined}>Finishes</Tag><Tag>A-34 Corner</Tag></Row>
                <Button size="sm" onClick={close}>Apply</Button>
              </div>
            )}
          </Popover>
        </Specimen>
        </div>
        <Specimen name="Calendar" note="Today jumps to now; arrow keys move by day and week">
          <Calendar value={day} onChange={setDay} />
        </Specimen>
      </Grid>
    </Section>
  );
}

export function NavigationSection() {
  const [step, setStep] = useState(2);
  const stages = [
    { id: "s0", label: "Not started" },
    { id: "s1", label: "Contacted buyer", detail: "Oct 20" },
    { id: "s2", label: "Met with buyer", detail: "Appointment Tue 3pm" },
    { id: "s3", label: "Finalized" },
    { id: "s4", label: "Confirmed by office" },
  ];
  return (
    <Section id="navigation" title="Navigation" blurb="Tabs and the stepper animate to wherever you are. The stepper is the vendor flow from the proposal.">
      <Specimen name="Breadcrumbs and tabs">
        <Breadcrumbs items={[{ label: "Projects", href: "/design" }, { label: "Beaver Crossing", href: "/design" }, { label: "Lot 12" }]} className="mb-4" />
        <Tabs
          label="House sections"
          tabs={[
            { id: "sel", label: "Selections", badge: 12, content: <p className="t-body">Everything this house chose, with totals.</p> },
            { id: "docs", label: "Documents", content: <p className="t-body">Signed sheets and invoices.</p> },
            { id: "msg", label: "Messages", badge: 3, content: <p className="t-body">Conversation with the buyers and vendors.</p> },
            { id: "hist", label: "History", content: <p className="t-body">Every change, with who and when.</p> },
          ]}
        />
      </Specimen>
      <Specimen name="Stepper" note="vendor stages; use the buttons to advance">
        <Stepper steps={stages} current={step} className="mb-6" />
        <Row>
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
          <Button size="sm" onClick={() => setStep((s) => Math.min(stages.length, s + 1))}>Advance</Button>
        </Row>
        <Divider className="my-6" label="Vertical" />
        <Stepper steps={stages.slice(0, 4)} current={Math.min(step, 3)} orientation="vertical" />
      </Specimen>
      <Specimen name="Accordion" note="sections of a selection sheet">
        <Accordion
          multiple
          defaultOpen={["kitchen"]}
          items={[
            { id: "kitchen", title: "Kitchen", meta: "4 items", content: <p className="t-body">Cabinets, countertops, backsplash, and fixtures.</p> },
            { id: "doors", title: "Doors", meta: "2 items", content: <p className="t-body">Interior and exterior door styles.</p> },
            { id: "stairs", title: "Stairs", meta: "1 item", content: <p className="t-body">Railing and tread finish.</p> },
          ]}
        />
      </Specimen>
    </Section>
  );
}

export function DataSection() {
  const [sort, setSort] = useState<SortState | null>({ columnId: "lot", direction: "asc" });
  const [selected, setSelected] = useState<string[]>(["2"]);
  const { addToast } = useToast();

  const rows = [...HOUSES].sort((a, b) => {
    if (!sort) return 0;
    const av = a[sort.columnId as keyof HouseRow];
    const bv = b[sort.columnId as keyof HouseRow];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.direction === "asc" ? cmp : -cmp;
  });

  const columns: Column<HouseRow>[] = [
    { id: "lot", header: "Lot", sortable: true, cell: (r) => <span className="font-semibold">{r.lot}</span> },
    { id: "address", header: "Address", cell: (r) => r.address },
    { id: "model", header: "Model", sortable: true, cell: (r) => r.model },
    { id: "status", header: "Status", cell: (r) => <StatusPill tone={r.status}>{r.statusLabel}</StatusPill> },
    { id: "total", header: "Total", sortable: true, align: "right", cell: (r) => <Money cents={r.total} compact /> },
  ];

  return (
    <Section id="data" title="Data display" blurb="Rows brighten as you point at them and tint when selected. Sort headers rotate their arrow. Stat cards draw their trend line in once. No colored edges anywhere.">
      <Specimen name="Data table" note="sortable, selectable, row click">
        <DataTable
          caption="Houses"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={setSort}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={(r) => addToast(`Opening ${r.lot}`, { tone: "info" })}
        />
        <p className="mt-3 t-small">{selected.length} selected</p>
      </Specimen>
      <Specimen name="Table, loading and empty states">
        <div className="space-y-6">
          <DataTable caption="Loading" columns={columns} rows={[]} rowKey={(r) => r.id} loading />
        </div>
      </Specimen>
      <Grid cols={3}>
        <StatCard label="Houses" value={80} icon="home" delta={{ value: 6, label: "this week" }} trend={[52, 55, 58, 61, 66, 70, 74, 80]} />
        <StatCard label="Signed sheets" value={142} icon="clipboard" delta={{ value: 18, label: "this week" }} trend={[40, 52, 60, 71, 88, 104, 121, 142]} />
        <StatCard label="Unpaid" value={38250} prefix="$" icon="dollar" delta={{ value: 12, label: "vs last week", goodWhenUp: false }} trend={[21, 24, 23, 28, 31, 30, 35, 38]} />
      </Grid>
      <Grid>
        <Specimen name="Cards">
          <div className="space-y-4">
            <Card>
              <CardHeader title="Finishes sheet" description="Due Nov 14" actions={<IconButton label="More" icon="chevron-right" size="sm" />} />
              <p className="t-body">Paint, flooring, tile, and lighting. 9 of 14 items chosen.</p>
              <CardFooter>
                <Button size="sm" variant="ghost">Preview</Button>
                <Button size="sm">Continue</Button>
              </CardFooter>
            </Card>
            <Card interactive onClick={() => addToast("Card clicked")}>
              <p className="t-ui font-semibold">Interactive card</p>
              <p className="mt-0.5 t-small">Lifts and outlines on hover.</p>
            </Card>
          </div>
        </Specimen>
        <Specimen name="Description list, avatars, tags">
          <DescriptionList
            items={[
              { term: "Project", value: "Beaver Crossing" },
              { term: "Model", value: "A-34 Middle" },
              { term: "Buyers", value: <AvatarGroup names={["Maria Hernandez", "Daniel Hernandez", "Sam Lee"]} /> },
              { term: "Trades", value: <Row className="gap-1.5"><Tag>Tile</Tag><Tag tone="brand">Electric</Tag></Row> },
            ]}
          />
          <Divider className="my-5" label="Tags" />
          <Row className="gap-2"><Tag>Tile</Tag><Tag tone="brand">Electric</Tag><Tag tone="ink" onRemove={() => undefined}>Finishes</Tag></Row>
          <Divider className="my-5" label="Avatars" />
          <Row className="gap-4"><Avatar name="Maria Hernandez" size="lg" status="online" /><Avatar name="Tile Co" status="away" /><Avatar name="Office" size="sm" /><Avatar name="Sam Lee" status="offline" /></Row>
        </Specimen>
      </Grid>
      <Specimen name="Timeline" note="a house's history">
        <Timeline
          events={[
            { id: "1", icon: "check-circle", tone: "ok", title: "Finishes sheet signed", detail: "Total $18,920.00", meta: "Maria Hernandez · Oct 22, 2:14 PM" },
            { id: "2", icon: "mail", tone: "brand", title: "Reminder emailed", meta: "System · Oct 21, 9:00 AM" },
            { id: "3", icon: "pencil", title: "Selected Slate Gray cabinets", meta: "Daniel Hernandez · Oct 20, 6:41 PM" },
            { id: "4", icon: "layers", title: "House moved to Finishes", meta: "Office · Oct 18, 11:05 AM" },
          ]}
        />
      </Specimen>
    </Section>
  );
}

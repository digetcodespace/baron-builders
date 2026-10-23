"use client";

import { useState } from "react";
import {
  AnimatedNumber,
  Banner,
  BrandLoader,
  BrandLogo,
  Button,
  EmptyState,
  ICON_NAMES,
  Icon,
  IconButton,
  LinkButton,
  Money,
  ProgressBar,
  Skeleton,
  Spinner,
  StatusPill,
  Tooltip,
} from "@/components/ui";
import { useToast } from "@/components/providers";
import { Grid, Row, Section, Specimen } from "./GalleryParts";

export function ActionsSection() {
  const [loading, setLoading] = useState(false);
  return (
    <Section id="actions" title="Actions" blurb="Buttons are cut in the shape of the logo's ground slab, not a generic rounded rectangle. Hover only shifts color, so nothing jumps. Icons ease forward. Loading shows moving stripes.">
      <Grid>
        <Specimen name="Button variants">
          <Row>
            <Button leftIcon="plus">Add house</Button>
            <Button variant="ink" rightIcon="arrow-right">Continue</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger" leftIcon="trash">Delete</Button>
          </Row>
        </Specimen>
        <Specimen name="Sizes and states">
          <Row>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg" rightIcon="arrow-right">Large</Button>
            <Button
              loading={loading}
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 1800);
              }}
            >
              {loading ? "Signing…" : "Sign sheet"}
            </Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Specimen>
      </Grid>
      <Grid>
        <Specimen name="Icon buttons" note="tooltips are built in; hover or tab to one">
          <Row>
            <IconButton label="Edit" icon="pencil" />
            <IconButton label="Download PDF" icon="download" variant="secondary" />
            <IconButton label="Send email" icon="send" variant="primary" />
            <IconButton label="Delete" icon="trash" variant="ink" />
            <IconButton label="Small" icon="plus" size="sm" />
            <IconButton label="Large" icon="sliders" size="lg" variant="secondary" />
          </Row>
        </Specimen>
        <Specimen name="Link button and tooltip on a disabled button" note="a disabled button always says why">
          <Row>
            <LinkButton href="/design" variant="secondary" rightIcon="arrow-up-right">Open house file</LinkButton>
            <Tooltip content="Sign the sheet first to unlock invoicing" side="bottom">
              <span className="inline-flex">
                <Button disabled>Send invoice</Button>
              </span>
            </Tooltip>
          </Row>
        </Specimen>
      </Grid>
      <Specimen name="Icon set" note={`${ICON_NAMES.length} icons, one file`}>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-10">
          {ICON_NAMES.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5 rounded-md p-2 text-center transition-colors hover:bg-ink-soft">
              <Icon name={name} size={22} />
              <span className="t-small !text-[length:var(--fs-label)]">{name}</span>
            </div>
          ))}
        </div>
      </Specimen>
    </Section>
  );
}

export function FeedbackSection() {
  const { addToast } = useToast();
  const [total, setTotal] = useState(184250);
  const [progress, setProgress] = useState(64);

  return (
    <Section id="feedback" title="Feedback" blurb="Status, loading, and messages. Toasts slide in with a countdown that pauses when you hover. Numbers roll like a meter.">
      <Grid>
        <Specimen name="Status pills" note="dot pulses for live work">
          <Row>
            <StatusPill>Not started</StatusPill>
            <StatusPill tone="info">Contacted buyer</StatusPill>
            <StatusPill tone="brand" live>Met with buyer</StatusPill>
            <StatusPill tone="warn">Due in 2 days</StatusPill>
            <StatusPill tone="ok">Confirmed</StatusPill>
            <StatusPill tone="bad">Overdue</StatusPill>
          </Row>
        </Specimen>
        <Specimen name="Toasts" note="click each">
          <Row>
            <Button size="sm" variant="secondary" onClick={() => addToast("Selections saved", { tone: "ok" })}>Success</Button>
            <Button size="sm" variant="secondary" onClick={() => addToast("Your sheet is due Nov 14", { tone: "info" })}>Info</Button>
            <Button size="sm" variant="secondary" onClick={() => addToast("This option changes your price", { tone: "warn" })}>Warning</Button>
            <Button size="sm" variant="secondary" onClick={() => addToast("We could not save that", { tone: "bad", durationMs: null, actionLabel: "Retry", onAction: () => addToast("Retrying…") })}>Sticky error</Button>
          </Row>
        </Specimen>
      </Grid>
      <Specimen name="Banners">
        <div className="space-y-3">
          <Banner tone="info" title="Selections open">Your Finishes sheet opened today. Choices are due Nov 14.</Banner>
          <Banner tone="warn" title="Payment required" actionLabel="Pay now" onAction={() => addToast("Opening payment…")}>Invoice 1042 is waiting for payment.</Banner>
          <Banner tone="ok" onDismiss={() => undefined}>Everything for Lot 12 is confirmed.</Banner>
          <Banner tone="bad" title="Couldn't send the email">The recipient address looks invalid.</Banner>
        </div>
      </Specimen>
      <Grid cols={3}>
        <Specimen name="Animated money" note="running total">
          <p className="font-display text-[length:var(--fs-h1)] font-extrabold tracking-tight">
            <Money cents={total} animated />
          </p>
          <Row className="mt-4">
            <Button size="sm" variant="secondary" onClick={() => setTotal((t) => t + 62500)}>+ $625</Button>
            <Button size="sm" variant="ghost" onClick={() => setTotal((t) => Math.max(0, t - 18500))}>− $185</Button>
          </Row>
        </Specimen>
        <Specimen name="Progress">
          <div className="space-y-5">
            <ProgressBar label="Sheet complete" value={progress} showValue />
            <ProgressBar label="Uploading PDF" />
            <Button size="sm" variant="secondary" onClick={() => setProgress((p) => (p >= 100 ? 8 : Math.min(100, p + 23)))}>Advance</Button>
          </div>
        </Specimen>
        <Specimen name="Number counter">
          <p className="font-display text-[length:var(--fs-display)] font-black leading-none tracking-tight">
            <AnimatedNumber value={total / 1000} decimals={1} suffix="k" />
          </p>
        </Specimen>
      </Grid>
      <Grid cols={3}>
        <Specimen name="Spinner">
          <Row className="gap-6 text-primary">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </Row>
        </Specimen>
        <Specimen name="Skeleton">
          <div className="flex items-center gap-3">
            <Skeleton circle className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </Specimen>
        <Specimen name="Brand loader" note="the towers build themselves">
          <BrandLoader />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen name="Empty state">
          <EmptyState
            icon="clipboard"
            title="No selections yet"
            description="Once your house reaches the Finishes stage, your sheet will open here."
            action={<Button variant="secondary" leftIcon="mail">Email the office</Button>}
          />
        </Specimen>
        <Specimen name="Logo" note="light and reverse, full and mark">
          <Row className="gap-6">
            <BrandLogo height={44} />
            <div className="rounded-md bg-ink p-3"><BrandLogo tone="reverse" height={44} /></div>
            <BrandLogo variant="mark" height={44} />
          </Row>
        </Specimen>
      </Grid>
    </Section>
  );
}

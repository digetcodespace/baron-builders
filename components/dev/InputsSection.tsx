"use client";

import { useState } from "react";
import {
  Checkbox,
  CurrencyField,
  DateField,
  EmailField,
  FileDropzone,
  InfoHint,
  NumberStepper,
  OptionCardGroup,
  OtpField,
  PhoneField,
  RadioGroup,
  SearchField,
  SegmentedControl,
  SelectField,
  Switch,
  TextArea,
  TextField,
  type DropzoneFile,
} from "@/components/ui";
import { useToast } from "@/components/providers";
import { Grid, Row, Section, Specimen } from "./GalleryParts";

const TRADES = [
  { value: "tile", label: "Tile", description: "Floors, walls, backsplash" },
  { value: "kitchen", label: "Kitchen cabinets" },
  { value: "electric", label: "Electrical" },
  { value: "paint", label: "Paint" },
  { value: "flooring", label: "Flooring", description: "Hardwood, vinyl, carpet" },
  { value: "plumbing", label: "Plumbing fixtures", disabled: true },
];

export function InputsSection() {
  const { addToast } = useToast();
  const [cents, setCents] = useState<number | null>(125000);
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [checked, setChecked] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <Section
      id="inputs"
      title="Inputs"
      blurb="Every field shares one frame. On focus the border color fades in all the way around, a soft halo follows, and a red line draws left to right along the whole bottom edge. On blur the line leaves to the right. Click into any of them."
    >
      <Grid>
        <Specimen name="Text field" note="label floats, slab draws on focus">
          <div className="space-y-4">
            <TextField label="Full name" defaultValue="Maria Hernandez" />
            <EmailField label="Email" value={email} onChange={setEmail} hint="We send selection reminders here." />
            <TextField label="Lot size" suffix="sq ft" inputMode="numeric" />
            <PhoneField label="Phone" value={phone} onChange={setPhone} hint={phone ? `Saved as ${phone}` : "Type any way you like; it formats as you go."} />
            <TextField label="Locked field" disabled defaultValue="Beaver Crossing" />
          </div>
        </Specimen>
        <Specimen name="Text area" note="grows as you type">
          <TextArea label="Note to the office" maxLength={240} showCount hint="Visible to staff only." />
        </Specimen>
      </Grid>

      <Grid>
        <Specimen name="Select" note="keyboard: arrows, type-ahead, Enter">
          <div className="space-y-4">
            <SelectField label="Trade" options={TRADES} defaultValue="tile" hint="Which company covers this trade is set per project." />
            <SelectField label="Searchable select" options={TRADES} searchable />
          </div>
        </Specimen>
        <Specimen name="Date, currency, search">
          <div className="space-y-4">
            <DateField label="Selections due" defaultValue="2026-11-14" hint="The cut-off buyers see." />
            <CurrencyField label="Upgrade price" value={cents} onChange={setCents} hint={`Stored as ${cents ?? 0} cents.`} />
            <SearchField onSearch={(q) => q && addToast(`Searching for "${q}"`, { tone: "info" })} placeholder="Search houses, buyers, lots" />
          </div>
        </Specimen>
      </Grid>

      <Grid cols={3}>
        <Specimen name="Checkbox">
          <div className="space-y-4">
            <Checkbox label="Include in invoice" description="Shows on the buyer's signed sheet." checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <Checkbox label="Mixed state" indeterminate />
            <Checkbox label="Disabled" disabled />
          </div>
        </Specimen>
        <Specimen name="Radio group">
          <RadioGroup
            legend="Door style"
            defaultValue="shaker"
            options={[
              { value: "shaker", label: "Shaker", description: "Included" },
              { value: "flat", label: "Flat panel" },
              { value: "glass", label: "Glass insert", disabled: true },
            ]}
          />
        </Specimen>
        <Specimen name="Switch" note="a yes/no add-on">
          <div className="space-y-4">
            <Switch label="Finished basement" description="Adds $18,500" defaultChecked />
            <Switch label="Smart thermostat" />
            <Switch label="Unavailable" disabled />
          </div>
        </Specimen>
      </Grid>

      <Grid>
        <Specimen name="Segmented control">
          <Row>
            <SegmentedControl label="View" options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }, { value: "map", label: "Map" }]} />
          </Row>
        </Specimen>
        <Specimen name="Quantity stepper" note="hold + or − to repeat">
          <Row className="gap-8">
            <NumberStepper label="Outlets" defaultValue={4} max={40} />
            <NumberStepper label="Recessed lights" defaultValue={12} unit="ea" />
          </Row>
        </Specimen>
      </Grid>

      <Specimen name="Option cards" note="a choose-one item (radio) and an add-on item (checkbox)">
        <div className="space-y-8">
          <OptionCardGroup
            legend="Kitchen cabinet color"
            columns={3}
            defaultValue="white"
            options={[
              { value: "white", title: "Chalk White", description: "Matte shaker", priceCents: 0 },
              { value: "gray", title: "Slate Gray", description: "Satin shaker", priceCents: 185000 },
              { value: "espresso", title: "Espresso", description: "Rich wood grain", priceCents: 240000 },
            ]}
          />
          <OptionCardGroup
            multiple
            legend="Add-ons"
            defaultValue={["lights"]}
            options={[
              { value: "lights", title: "Under-cabinet lighting", description: "LED, warm white", priceCents: 62500 },
              { value: "pantry", title: "Pull-out pantry", priceCents: 98000 },
            ]}
          />
        </div>
      </Specimen>

      <Grid>
        <Specimen name="One-time code" note="8 digits; try pasting a code">
          <OtpField length={8} onComplete={(code) => addToast(`Code ${code} entered`, { tone: "ok" })} />
        </Specimen>
        <Specimen name="File dropzone" note="drag a file over it">
          <FileDropzone label="Vendor selection sheet (PDF)" accept="application/pdf,.pdf" files={files} onFilesChange={setFiles} />
        </Specimen>
      </Grid>

      <Specimen name="Info hint" note="explains a field, never a button">
        <Row>
          <span className="t-ui">Appointment window</span>
          <InfoHint>Buyers see this window and the vendor confirms a time inside it.</InfoHint>
        </Row>
      </Specimen>
    </Section>
  );
}

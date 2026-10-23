"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { FieldError } from "./FieldError";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";

export interface DropzoneFile {
  file: File;
  /** 0 to 100 while uploading; omit when idle. */
  progress?: number;
}

export interface FileDropzoneProps {
  label: string;
  files: DropzoneFile[];
  onFilesChange: (files: DropzoneFile[]) => void;
  /** e.g. "application/pdf,.pdf" */
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  hint?: string;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept: string | undefined) {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

/** Drag a file in or click to browse. The border marches while you hover with a file. */
export function FileDropzone({
  label,
  files,
  onFilesChange,
  accept,
  multiple = false,
  maxSizeBytes = 10 * 1024 * 1024,
  hint,
  error,
  disabled,
  className = "",
}: FileDropzoneProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const add = (incoming: File[]) => {
    const accepted: DropzoneFile[] = [];
    let problem: string | null = null;
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) problem = `${file.name} is not an accepted file type.`;
      else if (file.size > maxSizeBytes) problem = `${file.name} is larger than ${formatSize(maxSizeBytes)}.`;
      else accepted.push({ file });
    }
    setLocalError(problem);
    if (accepted.length > 0) onFilesChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) add(Array.from(event.dataTransfer.files));
  };

  const shownError = error ?? localError;

  return (
    <div className={className}>
      <p className="mb-1.5 t-label text-n-600">{label}</p>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={id}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        data-dragging={dragging || undefined}
        className={`relative flex cursor-pointer flex-col items-center rounded-lg border border-dashed bg-surface px-6 py-8 text-center transition-[background-color,border-color,transform,translate,scale,rotate] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-primary-line hover:bg-primary-soft data-[dragging]:scale-[1.01] data-[dragging]:border-transparent data-[dragging]:bg-primary-soft ${shownError ? "border-bad" : "border-n-300"} ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        {dragging ? <span aria-hidden="true" className="march-border pointer-events-none absolute inset-0 animate-march rounded-lg" /> : null}
        <span
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] ${dragging ? "-translate-y-1.5 scale-110" : ""}`}
        >
          <Icon name="upload" size={22} />
        </span>
        <p id={id} className="t-ui font-semibold">
          <span className="text-primary">Choose a file</span> or drag it here
        </p>
        <p className="mt-0.5 t-small">{hint ?? `Up to ${formatSize(maxSizeBytes)}`}</p>
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      <FieldError message={shownError} />
      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((entry, index) => (
            <li
              key={`${entry.file.name}-${index}`}
              className="flex animate-rise-in items-center gap-3 rounded-md border border-border bg-surface p-3 shadow-low"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Icon name="file" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate t-ui font-medium">{entry.file.name}</p>
                {entry.progress !== undefined ? (
                  <ProgressBar value={entry.progress} className="mt-1.5" />
                ) : (
                  <p className="t-small">{formatSize(entry.file.size)}</p>
                )}
              </div>
              <IconButton
                label={`Remove ${entry.file.name}`}
                icon="x"
                size="sm"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

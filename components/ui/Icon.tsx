import type { ReactNode, SVGProps } from "react";

/** The Baron Builders icon set: 24px grid, 1.75 stroke, round caps. One file, no icon library. */
const PATHS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "chevron-up": <path d="M6 15l6-6 6 6" />,
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  "chevrons-up-down": <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  "arrow-up-right": <path d="M7 17L17 7M8 7h9v9" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  upload: <path d="M12 16V4M7 9l5-5 5 5M4.5 15v3.5A1.5 1.5 0 006 20h12a1.5 1.5 0 001.5-1.5V15" />,
  download: <path d="M12 4v12M7 11l5 5 5-5M4.5 19.5h15" />,
  file: (
    <>
      <path d="M14 3.5H7.5A1.5 1.5 0 006 5v14a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0018 19V7.5L14 3.5z" />
      <path d="M14 3.5V8h4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 4l9 15.5H3L12 4z" />
      <path d="M12 10v4M12 17v.01" />
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16v.01" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4 7.5l8 6 8-6" />
    </>
  ),
  phone: (
    <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 005.5 5.5L16 13l4 1.5v3a2 2 0 01-2 2A14 14 0 014.5 6a2 2 0 012-2z" />
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5v10h4v-5h4v5h4v-10" />
    </>
  ),
  building: (
    <>
      <path d="M5 20.5V8l7-3.5L19 8v12.5M3.5 20.5h17" />
      <path d="M9 10h.01M9 13.5h.01M9 17h.01M15 10h.01M15 13.5h.01M15 17h.01" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M2.5 19.5a6.5 6.5 0 0113 0" />
      <path d="M16 4.5a3.5 3.5 0 010 6.5M18 14a6.5 6.5 0 013.5 5.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0115 0" />
    </>
  ),
  sliders: <path d="M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4" />,
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15l1.5-2z" />
      <path d="M10 20.5a2 2 0 004 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  "log-out": (
    <>
      <path d="M10 4.5H6.5A1.5 1.5 0 005 6v12a1.5 1.5 0 001.5 1.5H10" />
      <path d="M15 8l4 4-4 4M19 12H9.5" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M9.5 7V4.5h5V7" />
      <path d="M7 7l.8 12a1.5 1.5 0 001.5 1.4h5.4a1.5 1.5 0 001.5-1.4L17 7M10 11v6M14 11v6" />
    </>
  ),
  pencil: (
    <>
      <path d="M5 19l.8-3.8L16.4 4.6a1.8 1.8 0 012.6 0l.4.4a1.8 1.8 0 010 2.6L8.8 18.2 5 19z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  dollar: (
    <path d="M12 3.5v17M16 7.5c-.6-1.3-2.2-2-4-2-2.2 0-4 1.1-4 2.9 0 4 8.3 2 8.3 6 0 1.8-1.9 2.9-4.3 2.9-2 0-3.8-.8-4.4-2.3" />
  ),
  send: <path d="M20.5 3.5L10 14M20.5 3.5L14 20.5l-4-6.5-6.5-4 17-6.5z" />,
  paperclip: (
    <path d="M18.5 11.5l-6.8 6.8a4.2 4.2 0 01-6-6l7.2-7.2a2.8 2.8 0 014 4l-7.2 7.2a1.4 1.4 0 01-2-2l6.5-6.5" />
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  list: <path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" />,
  filter: <path d="M4 6h16l-6 7.5V19l-4 1.5v-7L4 6z" />,
  "external-link": (
    <>
      <path d="M14 4.5h5.5V10M19.5 4.5L11 13" />
      <path d="M18 14v4a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 18V7.5A1.5 1.5 0 015.5 6H9.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6A1.5 1.5 0 0014 4.5H6A1.5 1.5 0 004.5 6v8A1.5 1.5 0 006 15.5h2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="11" width="13" height="9.5" rx="2" />
      <path d="M8.5 11V8a3.5 3.5 0 017 0v3" />
    </>
  ),
  layers: (
    <>
      <path d="M12 4l8.5 4.5L12 13 3.5 8.5 12 4z" />
      <path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9.5 3h5a1 1 0 011 1v1.5h-7V4a1 1 0 011-1z" />
      <path d="M8.5 5.5h-2A1.5 1.5 0 005 7v12.5A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V7a1.5 1.5 0 00-1.5-1.5h-2" />
      <path d="M9 13l2 2 4-4.5" />
    </>
  ),
  message: <path d="M5 5.5h14a1.5 1.5 0 011.5 1.5v8.5a1.5 1.5 0 01-1.5 1.5h-7l-4.5 3.5V17H5a1.5 1.5 0 01-1.5-1.5V7A1.5 1.5 0 015 5.5z" />,
  sparkle: <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5zM18.5 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className ?? ""}`}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];

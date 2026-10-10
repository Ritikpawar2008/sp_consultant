type IconName = "building" | "handover" | "community" | "document" | "stamp" | "folder" | "search" | "landmark" | "arrow" | "check" | "sparkle" | "phone" | "mail" | "menu" | "close" | "chat" | "calendar" | "location" | "spinner" | "x" | "log-out" | "refresh-cw" | "inbox" | "trash" | "alert-circle" | "message-square" | "star" | "chevron-left" | "upload" | "check-circle";

const paths: Record<IconName, React.ReactNode> = {
  "chevron-left": <polyline points="15 18 9 12 15 6" />,
  "upload": <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  "check-circle": <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  building: <><path d="M4 21V5.8c0-.7.5-1.3 1.2-1.5l12-2.8c1-.2 1.8.5 1.8 1.5V21"/><path d="M2 21h20M8 8h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2"/></>,
  handover: <><path d="M3 12h5l2 2 3-3 2 2 3-3 3 3-5 5a3 3 0 0 1-4.2 0L9 15H3"/><path d="M3 12V8.5A2.5 2.5 0 0 1 5.5 6H8l2 2"/></>,
  community: <><circle cx="12" cy="8" r="3"/><path d="M6 20v-1a6 6 0 0 1 12 0v1M4 12a2.5 2.5 0 0 1 2.5-2.5M20 12a2.5 2.5 0 0 0-2.5-2.5"/></>,
  document: <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 12h5m-5 4h5"/></>,
  stamp: <><path d="M8 15h8l1.5 3H6.5zM9 15v-2.5a3 3 0 1 1 6 0V15M5 21h14"/><circle cx="12" cy="7" r="2"/></>,
  folder: <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5z"/><path d="M3 10h18"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
  landmark: <><path d="m3 10 9-6 9 6M5 10v8m4-8v8m4-8v8m4-8v8M3 21h18M2 18h20"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  check: <path d="m5 12 4.5 4.5L19 7"/>,
  sparkle: <><path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></>,
  phone: <path d="M7 3h3l1.5 4-2.2 1.7a15.5 15.5 0 0 0 6 6L17 12.5 21 14v3c0 1.1-.9 2-2 2C10.2 19 5 13.8 5 7c0-1.1.9-2 2-2Z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  chat: <><path d="M20 11.5a7.5 7.5 0 0 1-9.7 7.2L5 20l1.3-4.1A7.5 7.5 0 1 1 20 11.5Z"/><path d="M9 12h.01M12 12h.01M15 12h.01"/></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/></>,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  spinner: <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  "log-out": <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>,
  "refresh-cw": <><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></>,
  inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  "alert-circle": <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  "message-square": <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  "star": <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

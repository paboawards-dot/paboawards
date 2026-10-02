import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconHome = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-6h4v6" /></svg>);
export const IconVote = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="12" width="18" height="8" rx="2" /><path d="M7 12V9.5L12 4l5 5.5V12" /><path d="m9.5 8.5 2 2 3.5-3.5" /></svg>);
export const IconUsers = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14.8c1.8.7 3 2.3 3.5 5.2" /></svg>);
export const IconTrophy = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11" /><path d="M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" /><path d="M12 14v4M8 21h8M9.5 18h5" /></svg>);
export const IconMenu = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconClose = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconPhone = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>);
export const IconCopy = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></svg>);
export const IconShare = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="6" cy="12" r="2.5" /><circle cx="17.5" cy="6" r="2.5" /><circle cx="17.5" cy="18" r="2.5" /><path d="m8.2 10.8 7.1-3.6M8.2 13.2l7.1 3.6" /></svg>);
export const IconDownload = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 4v11M7.5 11 12 15.5 16.5 11" /><path d="M4.5 19.5h15" /></svg>);
export const IconCheck = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m4.5 12.5 5 5 10-11" /></svg>);
export const IconSearch = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>);
export const IconArrow = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconBack = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);
export const IconClock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const IconAlert = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4.5M12 17.4v.1" /></svg>);
export const IconWifiOff = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 3l18 18" /><path d="M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-5-2.6M8.5 16a5 5 0 0 1 3-1.3M15.5 16a5 5 0 0 0-1.2-.9" /><path d="M12 19.5v.1" /></svg>);
export const IconLock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>);
export const IconInfo = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.1" /></svg>);
export const IconStar = ({ size, ...p }: P) => (<svg {...base(size)} {...p} fill="currentColor" strokeWidth={1}><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" /></svg>);
export const IconUp = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m6 14 6-6 6 6" /></svg>);
export const IconDown = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m6 10 6 6 6-6" /></svg>);
export const IconPlus = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14" /></svg>);

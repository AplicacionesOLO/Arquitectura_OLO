// ═══════════════════════════════════════════════════════════════════════════
// ÍCONOS DE LÍNEA — monocromos, heredan color del texto (currentColor).
// Estándar de diseño del Grupo: sin emojis como íconos de interfaz.
// ═══════════════════════════════════════════════════════════════════════════
const base = { width:"1em", height:"1em", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round" };

export function SearchIcon(props) {
  return <svg {...base} {...props}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>;
}

export function ShieldIcon(props) {
  return <svg {...base} {...props}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></svg>;
}

export function BellIcon(props) {
  return <svg {...base} {...props}><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
}

export function KeyIcon(props) {
  return <svg {...base} {...props}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/></svg>;
}

export function LinkIcon(props) {
  return <svg {...base} {...props}><path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 5.5 5.5l-1.5 1.5"/><path d="M13 18l-1 1A4 4 0 0 1 6.5 13.5L8 12"/></svg>;
}

export function ListIcon(props) {
  return <svg {...base} {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>;
}

export function SitemapIcon(props) {
  return <svg {...base} {...props}><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="3" y="17" width="6" height="4" rx="1"/><rect x="15" y="17" width="6" height="4" rx="1"/><path d="M12 7v5M12 12H6v5M12 12h6v5"/></svg>;
}

export function ExpandIcon(props) {
  return <svg {...base} {...props}><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>;
}

export function ContractIcon(props) {
  return <svg {...base} {...props}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>;
}

export function UsersIcon(props) {
  return <svg {...base} {...props}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16.5 14.2c2.6.5 4.5 2.6 4.5 5.8"/><circle cx="17" cy="8.5" r="2.6"/></svg>;
}

export function ClockIcon(props) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 3.2"/></svg>;
}

export function RobotIcon(props) {
  return <svg {...base} {...props}><rect x="5" y="9" width="14" height="10" rx="2"/><path d="M9 13v2M15 13v2M12 9V5M9 5h6"/></svg>;
}

export function EyeIcon(props) {
  return <svg {...base} {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export function FileIcon(props) {
  return <svg {...base} {...props}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/></svg>;
}

export function DotIcon(props) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="4"/></svg>;
}

export function BellDotIcon({ hasUnseen, ...props }) {
  return <span style={{ position:"relative", display:"inline-flex" }}>
    <BellIcon {...props}/>
    {hasUnseen && <span style={{ position:"absolute", top:-1, right:-1, width:7, height:7, borderRadius:"50%", background:"#b91c1c", border:"1.5px solid #fff" }}/>}
  </span>;
}

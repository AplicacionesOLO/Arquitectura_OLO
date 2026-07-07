// ═══════════════════════════════════════════════════════════════════════════
// VISTA · PROCESOS OPERATIVOS — grids lineales por categoría (Inbound,
// Outbound, CrossDocking, No Nacionalizado, Comercio, Administrativo)
// ═══════════════════════════════════════════════════════════════════════════
import { PROCESOS_CATEGORIAS } from "../data/procesosOperativos.js";

export function ProcesosOperativosView() {
  return <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    {PROCESOS_CATEGORIAS.map(cat => (
      <div key={cat.id} style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:`4px solid ${cat.color}`, borderRadius:10, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:cat.color, borderRadius:12, padding:"2px 9px", flexShrink:0 }}>{cat.num}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#1D1D1B" }}>{cat.label}</span>
          <span style={{ fontSize:11, color:"#999" }}>· {cat.procesos.length} proceso{cat.procesos.length!==1?"s":""}</span>
        </div>

        {cat.procesos.length === 0
          ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:60, border:"1px dashed #e0e0e0", borderRadius:8, color:"#aaa", fontSize:12 }}>
              Sin procesos agregados todavía.
            </div>
          : <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {cat.procesos.map(p => (
                <div key={p.id} style={{ background:"#fafafa", border:`1px solid ${cat.color}44`, borderRadius:8, padding:"10px 14px", minWidth:180 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1D1D1B" }}>{p.name}</div>
                  {p.desc && <div style={{ fontSize:11, color:"#777", marginTop:2 }}>{p.desc}</div>}
                </div>
              ))}
            </div>}
      </div>
    ))}
  </div>;
}

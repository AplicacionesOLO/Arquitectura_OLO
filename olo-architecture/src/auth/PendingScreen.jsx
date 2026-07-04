// ═══════════════════════════════════════════════════════════════════════════
// AUTH · Pantalla de espera — cuenta registrada pero sin rol/aprobación aún
// ═══════════════════════════════════════════════════════════════════════════
import { useAuth } from "./AuthContext.jsx";
import oloLogo from "../assets/olo-logo.png";

export function PendingScreen() {
  const { profile, status, signOut } = useAuth();
  const isDisabled = status === "disabled";

  return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f9fa", fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", padding:"40px 20px" }}>
    <div style={{ width:"100%", maxWidth:420, textAlign:"center" }}>
      <img src={oloLogo} alt="OLO" style={{ height:56, margin:"0 auto", display:"block" }}/>
      <div style={{ background:"#fff", border:"1px solid #e0e6ed", borderRadius:14, padding:"28px 26px", marginTop:24, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>{isDisabled ? "🔒" : "⏳"}</div>
        <h1 style={{ fontSize:17, fontWeight:800, color:"#1D1D1B", margin:"0 0 8px" }}>
          {isDisabled ? "Acceso deshabilitado" : "Cuenta pendiente de aprobación"}
        </h1>
        <p style={{ fontSize:13, color:"#666", lineHeight:1.6, margin:0 }}>
          {isDisabled
            ? "Un administrador deshabilitó el acceso de esta cuenta. Si crees que es un error, contacta al administrador del sistema."
            : "Tu cuenta se registró correctamente, pero necesita que un administrador te asigne un rol antes de poder ingresar. Te avisaremos — o intenta de nuevo más tarde."}
        </p>
        {profile?.email && <p style={{ fontSize:11, color:"#999", marginTop:14 }}>{profile.email}</p>}
        <button onClick={signOut} style={{ marginTop:18, width:"100%", padding:"9px", background:"#fff", border:"1px solid #e0e6ed", borderRadius:8, fontSize:12, fontWeight:600, color:"#475569", cursor:"pointer" }}>
          Cerrar sesión
        </button>
      </div>
      <p style={{ textAlign:"center", fontSize:10, color:"#94a3b8", marginTop:18 }}>OLO Architecture · acceso restringido</p>
    </div>
  </div>;
}

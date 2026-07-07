// ═══════════════════════════════════════════════════════════════════════════
// AUTH · Pantalla de login — email/password + Google OAuth (Supabase Auth)
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import oloLogo from "../assets/olo-logo.png";

const inputStyle = {
  width:"100%", fontSize:13, padding:"10px 12px", border:"1px solid #e0e6ed", borderRadius:8,
  outline:"none", fontFamily:"inherit", color:"#1D1D1B", background:"#fff", boxSizing:"border-box",
};
const labelStyle = { fontSize:11, fontWeight:600, color:"#475569", display:"block", marginBottom:5 };

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.4 34.9 26.9 36 24 36c-5.3 0-9.9-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.6-4.7 6.1l6.5 5.5C40.5 36.9 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>;
}

export function LoginScreen() {
  const { signInWithPassword, signUp, signInWithGoogle, resetPassword, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const switchMode = (m) => { setMode(m); setError(null); setNotice(null); setPassword(""); setPassword2(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "signup") {
      if (password !== password2) { setError("Las contraseñas no coinciden."); return; }
      setBusy(true); setNotice(null);
      const r = await signUp(email, password);
      setBusy(false);
      if (r.ok) { setNotice(`Cuenta creada. Te enviamos un correo a ${email} para confirmarla. Luego de confirmar, un administrador debe aprobar tu acceso antes de que puedas ingresar.`); setMode("login"); setPassword(""); setPassword2(""); }
      return;
    }
    setBusy(true); setNotice(null);
    await signInWithPassword(email, password);
    setBusy(false);
  };

  const handleForgot = async () => {
    if (!email) { setError("Escribe primero tu correo en el campo de arriba."); return; }
    setBusy(true);
    const r = await resetPassword(email);
    setBusy(false);
    if (r.ok) setNotice(`Te enviamos un correo a ${email} con instrucciones para restablecer tu contraseña.`);
  };

  return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f9fa", fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", padding:"40px 20px" }}>
    <div style={{ width:"100%", maxWidth:380 }}>

      <div style={{ textAlign:"center", marginBottom:28 }}>
        <img src={oloLogo} alt="OLO" style={{ height:56, margin:"0 auto", display:"block" }}/>
        <h1 style={{ margin:"16px 0 0", fontSize:22, fontWeight:800, color:"#1D1D1B", letterSpacing:"-0.01em" }}>BPA OLO</h1>
        <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>Softland v7.00 · eflow Cloud Suite</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background:"#fff", border:"1px solid #e0e6ed", borderRadius:14, padding:"26px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <label style={labelStyle} htmlFor="login-email">Correo electrónico</label>
        <input id="login-email" type="email" autoComplete="email" required value={email}
          onChange={e=>setEmail(e.target.value)} placeholder="tu@ologistics.com" style={inputStyle}/>

        <label style={{ ...labelStyle, marginTop:14 }} htmlFor="login-pass">Contraseña</label>
        <div style={{ position:"relative" }}>
          <input id="login-pass" type={showPw?"text":"password"} autoComplete={mode==="signup"?"new-password":"current-password"} required
            value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
            style={{ ...inputStyle, paddingRight:42 }}/>
          <button type="button" onClick={()=>setShowPw(s=>!s)} title={showPw?"Ocultar":"Mostrar"}
            style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:13, padding:6 }}>
            {showPw?"🙈":"👁"}
          </button>
        </div>

        {mode==="signup" && <>
          <label style={{ ...labelStyle, marginTop:14 }} htmlFor="login-pass2">Confirmar contraseña</label>
          <input id="login-pass2" type={showPw?"text":"password"} autoComplete="new-password" required
            value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="••••••••" style={inputStyle}/>
        </>}

        {mode==="login" && <div style={{ textAlign:"right", marginTop:8 }}>
          <button type="button" onClick={handleForgot} disabled={busy}
            style={{ background:"none", border:"none", color:"#00838f", fontSize:11, cursor:"pointer", fontWeight:600, padding:0 }}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>}

        {error && <div style={{ marginTop:14, padding:"9px 12px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12, lineHeight:1.5 }}>{error}</div>}
        {notice && <div style={{ marginTop:14, padding:"9px 12px", background:"#e0f7fa", border:"1px solid #80cbc4", borderRadius:8, color:"#00695c", fontSize:12, lineHeight:1.5 }}>{notice}</div>}

        <button type="submit" disabled={busy || !email || !password || (mode==="signup" && !password2)}
          style={{ width:"100%", marginTop:16, padding:"10px", background: busy?"#80cbc4":"#00838f", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor: busy?"default":"pointer", transition:"background 0.15s" }}>
          {busy?"Procesando…":mode==="signup"?"Crear cuenta":"Iniciar sesión"}
        </button>

        <div style={{ textAlign:"center", marginTop:12 }}>
          {mode==="login"
            ? <span style={{ fontSize:11, color:"#64748b" }}>¿No tienes cuenta? <button type="button" onClick={()=>switchMode("signup")} style={{ background:"none", border:"none", color:"#00838f", fontSize:11, fontWeight:700, cursor:"pointer", padding:0 }}>Crear cuenta</button></span>
            : <span style={{ fontSize:11, color:"#64748b" }}>¿Ya tienes cuenta? <button type="button" onClick={()=>switchMode("login")} style={{ background:"none", border:"none", color:"#00838f", fontSize:11, fontWeight:700, cursor:"pointer", padding:0 }}>Iniciar sesión</button></span>}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
          <div style={{ flex:1, height:1, background:"#e0e6ed" }}/>
          <span style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.05em" }}>O CONTINÚA CON</span>
          <div style={{ flex:1, height:1, background:"#e0e6ed" }}/>
        </div>

        <button type="button" onClick={signInWithGoogle}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"9px", background:"#fff", border:"1px solid #e0e6ed", borderRadius:8, fontSize:13, fontWeight:600, color:"#334155", cursor:"pointer" }}>
          <GoogleIcon/> Continuar con Google
        </button>
      </form>

      <p style={{ textAlign:"center", fontSize:10, color:"#94a3b8", marginTop:18, lineHeight:1.6 }}>
        Acceso restringido · OLO Logistics · las cuentas nuevas entran con acceso mínimo hasta que un administrador asigne su rol.
      </p>
    </div>
  </div>;
}

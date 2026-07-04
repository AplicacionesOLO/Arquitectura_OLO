// ═══════════════════════════════════════════════════════════════════════════
// AUTH · Contexto de sesión — Supabase Auth (email/password + Google OAuth)
// ═══════════════════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = aún no se sabe, null = sin sesión
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false); // distingue "sin perfil todavía" de "aún cargando"
  const [visibleTabs, setVisibleTabs] = useState(null); // null = aún no cargado; Set en cuanto resuelve
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); setProfileLoaded(false); setVisibleTabs(null); return; }
    const { data, error: err } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (err || !data) { setProfile(null); setProfileLoaded(true); setVisibleTabs(new Set()); return; }
    setProfile(data); setProfileLoaded(true);
    // Cuenta pendiente de aprobación o deshabilitada por un admin: sin secciones visibles.
    if (data.status !== "active") { setVisibleTabs(new Set()); return; }
    if (data.role === "admin") { setVisibleTabs("all"); return; }
    const { data: perms } = await supabase.from("role_permissions").select("tab_id,access").eq("role_key", data.role);
    setVisibleTabs(new Set((perms || []).filter(p => p.access === "view").map(p => p.tab_id)));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      loadProfile(data.session?.user?.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      loadProfile(s?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithPassword = useCallback(async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(traducirError(err));
    return { ok: !err };
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) { setError(traducirError(err)); return { ok: false }; }
    return { ok: true };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // Fuerza el selector de cuenta de Google en cada intento — sin esto,
      // Google reautentica en silencio con la sesión/cuenta ya activa en el
      // navegador, sin dar oportunidad de elegir otra cuenta.
      options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" } },
    });
    if (err) setError(traducirError(err));
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (err) { setError(traducirError(err)); return { ok: false }; }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    const role = profile?.role ?? null;
    const status = profile?.status ?? null;
    return {
      loading: session === undefined,
      user,
      profile,
      profileLoaded,
      role,
      status,
      isActive: status === "active",
      isPending: !!user && profileLoaded && status !== "active" && status !== "disabled",
      isDisabled: status === "disabled",
      isAdmin: role === "admin" && status === "active",
      isEditor: (role === "editor" || role === "admin") && status === "active",
      canView: () => !!user,
      canSeeTab: (tabId) => visibleTabs === "all" || visibleTabs?.has(tabId),
      permsLoading: !!user && visibleTabs === null,
      error,
      setError,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
    };
  }, [session, profile, profileLoaded, visibleTabs, error, signInWithPassword, signUp, signInWithGoogle, resetPassword, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function traducirError(err) {
  const m = err.message || "";
  if (m.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("Email not confirmed")) return "Confirma tu correo antes de iniciar sesión — revisa tu bandeja de entrada.";
  if (m.includes("provider is not enabled")) return "El inicio de sesión con Google aún no está activado en este proyecto.";
  if (m.includes("User already registered")) return "Ya existe una cuenta con este correo — intenta iniciar sesión.";
  if (m.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("Unable to validate email address")) return "El correo electrónico no es válido.";
  return m || "Ocurrió un error inesperado.";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}

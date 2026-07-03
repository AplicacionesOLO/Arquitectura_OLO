// ═══════════════════════════════════════════════════════════════════════════
// AUTH · Contexto de sesión — Supabase Auth (email/password + Google OAuth)
// ═══════════════════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = aún no se sabe, null = sin sesión
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data, error: err } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (err) { setProfile(null); return; }
    setProfile(data);
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

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
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
    return {
      loading: session === undefined,
      user,
      profile,
      role,
      isAdmin: role === "admin",
      isEditor: role === "editor" || role === "admin",
      canView: () => !!user,
      error,
      setError,
      signInWithPassword,
      signInWithGoogle,
      resetPassword,
      signOut,
    };
  }, [session, profile, error, signInWithPassword, signInWithGoogle, resetPassword, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function traducirError(err) {
  const m = err.message || "";
  if (m.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("Email not confirmed")) return "Confirma tu correo antes de iniciar sesión — revisa tu bandeja de entrada.";
  if (m.includes("provider is not enabled")) return "El inicio de sesión con Google aún no está activado en este proyecto.";
  return m || "Ocurrió un error inesperado.";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (uid: string | undefined) => {
    if (!uid) { setIsAdmin(false); return; }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    // Listener FIRST, then initial session check (per Supabase guidance)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Defer role lookup so we don't deadlock the auth callback
      setTimeout(() => loadRole(s?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      loadRole(s?.user?.id).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [loadRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }, []);

  const refreshRole = useCallback(async () => {
    await loadRole(user?.id);
  }, [loadRole, user?.id]);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const emailSchema = z.string().trim().email().max(255);
const pwSchema = z.string().min(8).max(128);

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: isAdmin ? "/admin" : "/account" });
    }
  }, [loading, user, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      pwSchema.parse(password);
    } catch {
      toast.error("Enter a valid email and an 8+ character password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/account`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email) { toast.error("Enter your email first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent.");
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/account`,
    });
    if (result.error) { toast.error("Google sign-in failed"); setBusy(false); return; }
    if (result.redirected) return;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10">
        <Link to="/" className="text-xs text-muted-foreground hover:text-gold">← Back to site</Link>
        <h1 className="font-display text-3xl text-gradient mt-4">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "signin" ? "Sign in to access the admin dashboard." : "Sign up to manage your site."}
        </p>

        <button onClick={google} disabled={busy} className="btn-luxe w-full mt-6 !bg-foreground !text-background">
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> or <span className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field label="Name">
              <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} />
            </Field>
          )}
          <Field label="Email">
            <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Field>
          <Field label="Password">
            <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </Field>
          <button disabled={busy} className="btn-luxe w-full !py-3.5">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "signin" && (
          <button onClick={forgot} className="text-xs text-muted-foreground hover:text-gold mt-4 block w-full text-center">
            Forgot your password?
          </button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have one?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold hover:underline">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <style>{`
          .auth-input {
            width:100%; background:oklch(1 0 0/.03); border:1px solid var(--glass-border);
            border-radius:.875rem; padding:.875rem 1rem; font-size:.95rem; color:var(--foreground);
          }
          .auth-input:focus { outline:none; border-color:var(--gold); }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password" }, { name: "robots", content: "noindex,nofollow" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Min 8 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10">
        <Link to="/" className="text-xs text-muted-foreground hover:text-gold">← Back to site</Link>
        <h1 className="font-display text-3xl text-gradient mt-4">Set a new password</h1>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full mt-6 bg-background/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
        />
        <button disabled={busy} className="btn-luxe w-full mt-4">{busy ? "…" : "Update password"}</button>
      </form>
    </div>
  );
}

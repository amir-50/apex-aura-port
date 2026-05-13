import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, ShieldCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Your account — Amir Nazir" }, { name: "robots", content: "noindex,nofollow" }] }),
});

type Sub = {
  id: string; status: string; created_at: string; transaction_id: string | null;
  amount: number | null; currency: string | null; admin_note: string | null;
  current_period_end: string | null;
  packages: { name: string; interval: string } | null;
};

function AccountPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ""));
    supabase.from("subscriptions")
      .select("id,status,created_at,transaction_id,amount,currency,admin_note,current_period_end,packages(name,interval)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setSubs((data as any) ?? []));
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setSavingName(false);
    if (error) toast.error(error.message); else toast.success("Profile updated.");
  };

  const changePw = async () => {
    if (pw.length < 8) { toast.error("Min 8 chars."); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message);
    else { toast.success("Password changed."); setPw(""); }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="container-luxe mx-auto max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Account</span>
            <h1 className="font-display text-4xl md:text-5xl text-gradient mt-2">Welcome{name ? `, ${name}` : ""}</h1>
            <p className="text-sm text-muted-foreground mt-2">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link to="/admin" className="glass px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:text-gold">
                <ShieldCheck size={14}/> Admin
              </Link>
            )}
            <button onClick={() => signOut()} className="glass px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:text-destructive">
              <LogOut size={14}/> Sign out
            </button>
          </div>
        </div>

        <section className="glass-card rounded-3xl p-6 mt-10 space-y-4">
          <h2 className="font-display text-xl">Profile</h2>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold" />
          </label>
          <button onClick={saveName} disabled={savingName} className="btn-luxe !py-2.5 !text-xs">{savingName ? "…" : "Save"}</button>
        </section>

        <section className="glass-card rounded-3xl p-6 mt-6 space-y-4">
          <h2 className="font-display text-xl">Change password</h2>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (min 8)"
            className="w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold" />
          <button onClick={changePw} className="btn-luxe !py-2.5 !text-xs">Update password</button>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Your subscriptions</h2>
            <Link to="/pricing" className="text-xs text-gold hover:underline flex items-center gap-1">View packages <ExternalLink size={12}/></Link>
          </div>
          {subs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 mt-4 text-center text-sm text-muted-foreground">
              No subscriptions yet. <Link to="/pricing" className="text-gold hover:underline">Browse packages →</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {subs.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-medium">{s.packages?.name ?? "Package"}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.amount ? `${s.currency ?? "USD"} ${s.amount}` : ""} · {new Date(s.created_at).toLocaleDateString()}
                      </div>
                      {s.transaction_id && <div className="text-[11px] text-muted-foreground mt-1">TX: {s.transaction_id}</div>}
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.admin_note && (
                    <p className="text-xs text-foreground/80 mt-3 border-t border-border pt-3">
                      <span className="text-muted-foreground">Note from admin:</span> {s.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300",
    active: "bg-emerald-500/20 text-emerald-300",
    rejected: "bg-red-500/20 text-red-300",
    expired: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${map[status] ?? "glass"}`}>{status}</span>;
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, RotateCcw, Trash2 } from "lucide-react";

const inputCls = "w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/* ─────────────── Orders / Subscriptions ─────────────── */
type Sub = {
  id: string; user_id: string; status: string; created_at: string;
  transaction_id: string | null; amount: number | null; currency: string | null;
  proof_path: string | null; admin_note: string | null; user_note: string | null;
  packages: { name: string } | null;
  profiles: { email: string | null; display_name: string | null } | null;
};

export function OrdersTab() {
  const [items, setItems] = useState<Sub[]>([]);
  const [filter, setFilter] = useState<"pending" | "active" | "rejected" | "all">("pending");

  const load = async () => {
    let q = supabase.from("subscriptions")
      .select("id,user_id,status,created_at,transaction_id,amount,currency,proof_path,admin_note,user_note,packages(name)")
      .order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const subs = (data as any[]) ?? [];
    if (subs.length) {
      const ids = Array.from(new Set(subs.map(s => s.user_id)));
      const { data: profs } = await supabase.from("profiles").select("user_id,email,display_name").in("user_id", ids);
      const map = new Map((profs ?? []).map(p => [p.user_id, p]));
      for (const s of subs) (s as any).profiles = map.get(s.user_id) ?? null;
    }
    setItems(subs as Sub[]);
  };
  useEffect(() => { load(); }, [filter]);

  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Could not open proof");
  };

  const decide = async (s: Sub, status: "active" | "rejected") => {
    const note = prompt(status === "active" ? "Optional note to user:" : "Reason for rejection:") ?? "";
    const patch: any = { status, admin_note: note || null };
    if (status === "active") {
      const d = new Date(); d.setMonth(d.getMonth() + 1);
      patch.current_period_end = d.toISOString();
    }
    const { error } = await supabase.from("subscriptions").update(patch).eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {(["pending","active","rejected","all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full ${filter===f?"bg-gold text-primary-foreground":"glass text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground p-6 text-center glass-card rounded-2xl">No orders.</p>}
      {items.map(s => (
        <div key={s.id} className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">{s.packages?.name ?? "Package"} · {s.currency} {s.amount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.profiles?.display_name ?? "—"} · <a href={`mailto:${s.profiles?.email}`} className="text-gold hover:underline">{s.profiles?.email}</a>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">TX: {s.transaction_id ?? "—"}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-[0.2em] glass px-2 py-1 rounded-full">{s.status}</span>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          {s.user_note && <p className="text-xs text-muted-foreground italic">"{s.user_note}"</p>}
          <div className="flex gap-2 pt-2 border-t border-border">
            {s.proof_path && <button onClick={() => viewProof(s.proof_path!)} className="text-xs glass px-3 py-1.5 rounded-md hover:text-gold">View proof</button>}
            {s.status === "pending" && <>
              <button onClick={() => decide(s, "active")} className="text-xs glass px-3 py-1.5 rounded-md hover:text-emerald-400">Approve</button>
              <button onClick={() => decide(s, "rejected")} className="text-xs glass px-3 py-1.5 rounded-md hover:text-destructive">Reject</button>
            </>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── Packages ─────────────── */
type Pkg = { id?: string; name: string; description: string | null; price: number; currency: string; interval: string; features: any; sort_order: number; highlighted: boolean; active: boolean };

export function PackagesTab() {
  const [items, setItems] = useState<Pkg[]>([]);
  const load = () => supabase.from("packages").select("*").order("sort_order").then(({ data }) => setItems((data as any) ?? []));
  useEffect(() => { load(); }, []);

  const save = async (p: Pkg) => {
    const features = Array.isArray(p.features) ? p.features : String(p.features ?? "").split("\n").map(s => s.trim()).filter(Boolean);
    const payload = { ...p, features };
    const { error } = p.id
      ? await supabase.from("packages").update(payload).eq("id", p.id)
      : await supabase.from("packages").insert(payload);
    if (error) toast.error(error.message); else { toast.success("Saved"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <div key={p.id ?? i} className="glass-card rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name"><input className={inputCls} value={p.name} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,name:e.target.value}:x))}/></Field>
            <Field label="Price"><input type="number" step="0.01" className={inputCls} value={p.price} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,price:parseFloat(e.target.value)}:x))}/></Field>
            <Field label="Currency"><input className={inputCls} value={p.currency} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,currency:e.target.value}:x))}/></Field>
            <Field label="Interval"><input className={inputCls} value={p.interval} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,interval:e.target.value}:x))}/></Field>
          </div>
          <Field label="Description"><textarea rows={2} className={inputCls + " resize-none"} value={p.description ?? ""} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,description:e.target.value}:x))}/></Field>
          <Field label="Features (one per line)">
            <textarea rows={4} className={inputCls + " resize-none"}
              value={Array.isArray(p.features) ? p.features.join("\n") : String(p.features ?? "")}
              onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,features:e.target.value.split("\n")}:x))}/>
          </Field>
          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={p.highlighted} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,highlighted:e.target.checked}:x))}/>Highlighted</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={p.active} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,active:e.target.checked}:x))}/>Active</label>
            <input type="number" className={inputCls + " !w-20"} value={p.sort_order} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,sort_order:parseInt(e.target.value)||0}:x))}/>
          </div>
          <div className="flex gap-2">
            <button onClick={() => save(p)} className="text-xs glass px-3 py-1.5 rounded-md hover:text-gold">Save</button>
            {p.id && <button onClick={() => remove(p.id!)} className="text-xs glass px-3 py-1.5 rounded-md hover:text-destructive flex items-center gap-1"><Trash2 size={11}/>Delete</button>}
          </div>
        </div>
      ))}
      <button onClick={() => setItems(arr => [...arr, { name: "New Package", description: "", price: 99, currency: "USD", interval: "month", features: [], sort_order: arr.length+1, highlighted: false, active: true }])}
        className="text-xs glass px-3 py-2 rounded-md hover:text-gold w-full">+ Add package</button>
    </div>
  );
}

/* ─────────────── Payment Methods ─────────────── */
type PM = { id?: string; kind: string; label: string; instructions: string; enabled: boolean; sort_order: number };

export function PaymentMethodsTab() {
  const [items, setItems] = useState<PM[]>([]);
  const load = () => supabase.from("payment_methods").select("*").order("sort_order").then(({ data }) => setItems((data as any) ?? []));
  useEffect(() => { load(); }, []);

  const save = async (m: PM) => {
    const { error } = m.id
      ? await supabase.from("payment_methods").update(m).eq("id", m.id)
      : await supabase.from("payment_methods").insert(m);
    if (error) toast.error(error.message); else { toast.success("Saved"); load(); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this method?")) return;
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Toggle which payment instructions show on the checkout page.</p>
      {items.map((m, i) => (
        <div key={m.id ?? i} className="glass-card rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Kind"><select className={inputCls} value={m.kind} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,kind:e.target.value}:x))}>
              <option value="bank">Bank</option><option value="wallet">Wallet</option><option value="other">Other</option>
            </select></Field>
            <Field label="Label"><input className={inputCls} value={m.label} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,label:e.target.value}:x))}/></Field>
          </div>
          <Field label="Instructions">
            <textarea rows={5} className={inputCls + " resize-none font-mono text-xs"} value={m.instructions} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,instructions:e.target.value}:x))}/>
          </Field>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={m.enabled} onChange={e => setItems(arr => arr.map((x,idx) => idx===i?{...x,enabled:e.target.checked}:x))}/>Enabled</label>
            <button onClick={() => save(m)} className="glass px-3 py-1.5 rounded-md hover:text-gold">Save</button>
            {m.id && <button onClick={() => remove(m.id!)} className="glass px-3 py-1.5 rounded-md hover:text-destructive">Delete</button>}
          </div>
        </div>
      ))}
      <button onClick={() => setItems(arr => [...arr, { kind: "bank", label: "New method", instructions: "", enabled: true, sort_order: arr.length+1 }])}
        className="text-xs glass px-3 py-2 rounded-md hover:text-gold w-full">+ Add method</button>
    </div>
  );
}

/* ─────────────── Email settings (SMTP) ─────────────── */
export function EmailsTab() {
  const [s, setS] = useState<any>({ smtp_host: "", smtp_port: 587, smtp_user: "", smtp_pass: "", smtp_secure: false, from_name: "Amir Nazir", from_email: "", enabled: false });
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("email_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => { if (data) setS(data); });
  }, []);

  const save = async () => {
    const { error } = await supabase.from("email_settings").update({ ...s, id: 1 }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const sendTest = async () => {
    if (!testTo) { toast.error("Recipient required"); return; }
    setBusy(true);
    try {
      const { sendTestEmail } = await import("@/lib/email.functions");
      const r = await sendTestEmail({ data: { to: testTo } });
      if ((r as any)?.ok) toast.success("Test email sent (or fallback used).");
      else toast.error((r as any)?.error ?? "Send failed");
    } catch (e: any) { toast.error(e?.message ?? "Send failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Configure SMTP. If left empty, the platform's default email service is used as fallback.</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.enabled} onChange={e => setS({ ...s, enabled: e.target.checked })}/>Enable SMTP</label>
      <div className="grid grid-cols-2 gap-2">
        <Field label="From name"><input className={inputCls} value={s.from_name ?? ""} onChange={e => setS({ ...s, from_name: e.target.value })}/></Field>
        <Field label="From email"><input className={inputCls} value={s.from_email ?? ""} onChange={e => setS({ ...s, from_email: e.target.value })}/></Field>
        <Field label="SMTP host"><input className={inputCls} value={s.smtp_host ?? ""} onChange={e => setS({ ...s, smtp_host: e.target.value })}/></Field>
        <Field label="SMTP port"><input type="number" className={inputCls} value={s.smtp_port ?? 587} onChange={e => setS({ ...s, smtp_port: parseInt(e.target.value) })}/></Field>
        <Field label="SMTP user"><input className={inputCls} value={s.smtp_user ?? ""} onChange={e => setS({ ...s, smtp_user: e.target.value })}/></Field>
        <Field label="SMTP password"><input type="password" className={inputCls} value={s.smtp_pass ?? ""} onChange={e => setS({ ...s, smtp_pass: e.target.value })}/></Field>
      </div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={s.smtp_secure} onChange={e => setS({ ...s, smtp_secure: e.target.checked })}/>Use TLS (port 465)</label>
      <div className="flex gap-2">
        <button onClick={save} className="text-xs glass px-3 py-2 rounded-md hover:text-gold">Save settings</button>
      </div>
      <div className="border-t border-border pt-3 mt-3 space-y-2">
        <Field label="Send test email to"><input className={inputCls} type="email" value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="you@example.com"/></Field>
        <button onClick={sendTest} disabled={busy} className="text-xs glass px-3 py-2 rounded-md hover:text-gold flex items-center gap-1.5"><Mail size={12}/>{busy ? "Sending…" : "Send test"}</button>
      </div>
      <EmailLogList />
    </div>
  );
}

function EmailLogList() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);
  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email log</h4>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1"><RotateCcw size={11}/>Refresh</button>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {items.map(e => (
          <div key={e.id} className="text-xs glass rounded-md p-2 flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="truncate">{e.subject}</div>
              <div className="text-[10px] text-muted-foreground truncate">{e.to_email} · {e.template ?? "—"}</div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${e.status === "sent" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{e.status}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground italic">No emails sent yet.</p>}
      </div>
    </div>
  );
}

/* ─────────────── Users ─────────────── */
export function UsersTab() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("user_id,email,display_name,created_at").order("created_at", { ascending: false }).limit(200);
    const ids = (profs ?? []).map(p => p.user_id);
    const { data: roles } = ids.length ? await supabase.from("user_roles").select("user_id,role").in("user_id", ids) : { data: [] as any[] };
    const map = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = map.get(r.user_id) ?? []; arr.push(r.role); map.set(r.user_id, arr);
    }
    setItems((profs ?? []).map(p => ({ ...p, roles: map.get(p.user_id) ?? [] })));
  };
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (uid: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) toast.error(error.message); else { toast.success("Demoted"); load(); }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) toast.error(error.message); else { toast.success("Promoted"); load(); }
    }
  };

  const sendReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Reset link sent");
  };

  return (
    <div className="space-y-2">
      {items.map(u => {
        const isAdmin = u.roles.includes("admin");
        return (
          <div key={u.user_id} className="glass-card rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="font-medium text-sm">{u.display_name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{isAdmin ? "Admin" : "User"} · joined {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => sendReset(u.email)} className="text-xs glass px-2.5 py-1.5 rounded-md hover:text-gold">Reset pw</button>
                <button onClick={() => toggleAdmin(u.user_id, isAdmin)} className="text-xs glass px-2.5 py-1.5 rounded-md hover:text-gold">{isAdmin ? "Demote" : "Make admin"}</button>
              </div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-muted-foreground p-6 text-center glass-card rounded-2xl">No users.</p>}
    </div>
  );
}

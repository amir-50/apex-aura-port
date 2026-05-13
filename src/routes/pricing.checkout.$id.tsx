import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pricing/checkout/$id")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Amir Nazir" }, { name: "robots", content: "noindex,nofollow" }] }),
});

type Pkg = { id: string; name: string; price: number; currency: string; interval: string };
type PM = { id: string; kind: string; label: string; instructions: string };

function CheckoutPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [methods, setMethods] = useState<PM[]>([]);
  const [methodId, setMethodId] = useState<string>("");
  const [tx, setTx] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase.from("packages").select("id,name,price,currency,interval").eq("id", id).maybeSingle()
      .then(({ data }) => setPkg(data as any));
    supabase.from("payment_methods").select("id,kind,label,instructions").eq("enabled", true).order("sort_order")
      .then(({ data }) => {
        setMethods((data as any) ?? []);
        if (data && data[0]) setMethodId(data[0].id);
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pkg) return;
    if (!file) { toast.error("Upload your payment screenshot."); return; }
    if (!tx.trim()) { toast.error("Enter the transaction ID."); return; }
    if (!methodId) { toast.error("Select a payment method."); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        package_id: pkg.id,
        status: "pending",
        transaction_id: tx.trim(),
        payment_method_id: methodId,
        proof_path: path,
        user_note: note.trim() || null,
        amount: pkg.price,
        currency: pkg.currency,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Payment submitted. We'll review shortly.");
    } catch (err: any) {
      toast.error(err?.message ?? "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-6 py-24">
        <div className="max-w-md text-center glass-card rounded-3xl p-10">
          <CheckCircle2 className="mx-auto text-emerald-400" size={42}/>
          <h1 className="font-display text-2xl mt-4">Payment received</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Your subscription is pending approval. You'll get a notification once it's activated — usually within 24 hours.
          </p>
          <Link to="/account" className="btn-luxe mt-6 inline-block">Go to your account</Link>
        </div>
      </div>
    );
  }

  const selected = methods.find((m) => m.id === methodId);

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="container-luxe mx-auto max-w-3xl">
        <Link to="/pricing" className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1.5">
          <ArrowLeft size={12}/> Back to pricing
        </Link>
        <h1 className="font-display text-4xl md:text-5xl text-gradient mt-4">Complete your subscription</h1>
        {pkg && (
          <p className="text-muted-foreground mt-2">
            {pkg.name} · <span className="text-foreground">{pkg.currency} {pkg.price}</span> / {pkg.interval}
          </p>
        )}

        <form onSubmit={submit} className="mt-10 space-y-6">
          <section className="glass-card rounded-3xl p-6">
            <h2 className="font-display text-lg">1. Choose a payment method</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethodId(m.id)}
                  className={`text-left glass rounded-2xl p-4 transition-colors ${methodId === m.id ? "ring-2 ring-gold/60" : "hover:border-gold/40"}`}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{m.kind}</div>
                  <div className="font-medium mt-1">{m.label}</div>
                </button>
              ))}
              {methods.length === 0 && <div className="text-sm text-muted-foreground col-span-2">No payment methods configured yet.</div>}
            </div>
            {selected && (
              <pre className="mt-4 bg-background/50 rounded-xl p-4 text-xs whitespace-pre-wrap font-mono text-foreground/90 border border-border">
                {selected.instructions}
              </pre>
            )}
          </section>

          <section className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg">2. Submit your proof</h2>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Transaction ID *</span>
              <input value={tx} onChange={(e) => setTx(e.target.value)} required maxLength={120}
                className="mt-1.5 w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Screenshot *</span>
              <div className="mt-1.5 flex items-center gap-3">
                <label className="glass rounded-xl px-4 py-3 text-xs cursor-pointer hover:text-gold flex items-center gap-2">
                  <Upload size={13}/> {file ? "Replace" : "Choose file"}
                  <input type="file" accept="image/*,application/pdf" hidden
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                {file && <span className="text-xs text-muted-foreground truncate">{file.name}</span>}
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Note (optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500}
                className="mt-1.5 w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold resize-none" />
            </label>
          </section>

          <button disabled={busy} className="btn-luxe w-full !py-4">{busy ? "Submitting…" : "Submit payment"}</button>
        </form>
      </div>
    </div>
  );
}

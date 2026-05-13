import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Amir Nazir" },
      { name: "description", content: "Transparent monthly packages for ongoing creative partnerships." },
    ],
  }),
});

type Pkg = {
  id: string; name: string; description: string | null; price: number; currency: string;
  interval: string; features: string[]; highlighted: boolean; sort_order: number;
};

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkgs, setPkgs] = useState<Pkg[]>([]);

  useEffect(() => {
    supabase.from("packages").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => setPkgs((data as any) ?? []));
  }, []);

  const subscribe = (id: string) => {
    if (!user) {
      navigate({ to: "/login", search: { next: `/pricing/checkout/${id}` } as any });
    } else {
      navigate({ to: "/pricing/checkout/$id", params: { id } });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6">
      <div className="container-luxe mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Pricing</span>
          <h1 className="font-display text-5xl md:text-6xl text-gradient mt-3">Choose your package</h1>
          <p className="text-muted-foreground mt-4">
            Transparent monthly partnerships. Pay by bank transfer or mobile wallet — submit proof and we'll activate within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {pkgs.map((p) => (
            <div
              key={p.id}
              className={`glass-card rounded-3xl p-8 flex flex-col relative ${p.highlighted ? "ring-2 ring-gold/60" : ""}`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary-foreground text-[10px] uppercase tracking-[0.25em] px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={11}/> Most chosen
                </span>
              )}
              <h3 className="font-display text-2xl">{p.name}</h3>
              {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl text-gradient">{p.currency} {p.price}</span>
                <span className="text-xs text-muted-foreground">/ {p.interval}</span>
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {(p.features ?? []).map((f, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Check size={14} className="text-gold mt-1 shrink-0"/> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => subscribe(p.id)} className="btn-luxe w-full mt-8">Subscribe</button>
            </div>
          ))}
          {pkgs.length === 0 && (
            <div className="md:col-span-3 text-center text-muted-foreground py-16">No packages available yet.</div>
          )}
        </div>

        {!user && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            <Link to="/login" className="text-gold hover:underline">Sign in</Link> to subscribe.
          </p>
        )}
      </div>
    </div>
  );
}

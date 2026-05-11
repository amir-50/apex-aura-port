import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, LogOut, Inbox, ClipboardList, Settings2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Submission = { id: string; name: string; email: string; subject: string | null; message: string; created_at: string };
type Booking = { id: string; name: string; email: string; phone: string | null; service: string | null; budget: string | null; timeline: string | null; details: string | null; status: string; created_at: string };

function AdminPage() {
  const { user, isAdmin, loading, signOut, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"editor" | "messages" | "bookings">("editor");
  const [messages, setMessages] = useState<Submission[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setMessages((data as Submission[]) ?? []));
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setBookings((data as Booking[]) ?? []));
  }, [isAdmin]);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_admin_if_none");
    setClaiming(false);
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("You're now the admin."); await refreshRole(); }
    else toast.error("An admin already exists. Ask them to grant you access.");
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 py-24">
        <div className="max-w-md text-center glass-card rounded-3xl p-10">
          <ShieldCheck className="mx-auto text-gold" size={36} />
          <h1 className="font-display text-2xl mt-4">Admin access required</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Signed in as <span className="text-foreground">{user.email}</span> — but this account isn't an admin.
          </p>
          <button onClick={claim} disabled={claiming} className="btn-luxe w-full mt-6">
            {claiming ? "…" : "Claim admin (first user only)"}
          </button>
          <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-gold mt-4">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="container-luxe mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Admin</span>
            <h1 className="font-display text-4xl md:text-5xl text-gradient mt-2">Control Center</h1>
            <p className="text-sm text-muted-foreground mt-2">Signed in as {user.email}</p>
          </div>
          <button onClick={() => signOut()} className="glass px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:text-destructive">
            <LogOut size={14}/> Sign out
          </button>
        </div>

        <nav className="mt-8 flex gap-2 flex-wrap">
          <TabBtn active={tab === "editor"} onClick={() => setTab("editor")} icon={<Settings2 size={14}/>}>Site editor</TabBtn>
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")} icon={<Inbox size={14}/>}>Messages ({messages.length})</TabBtn>
          <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")} icon={<ClipboardList size={14}/>}>Bookings ({bookings.length})</TabBtn>
        </nav>

        <div className="mt-8">
          {tab === "editor" && (
            <div className="glass-card rounded-3xl p-8">
              <h2 className="font-display text-2xl">Live site editor</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Open the floating editor (bottom-right) on any page to change colors, typography, sections, hero, projects, SEO and more. All changes save to your backend instantly and sync across every visitor.
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/" className="btn-luxe">Open site editor →</Link>
              </div>
            </div>
          )}
          {tab === "messages" && <MessagesList items={messages} />}
          {tab === "bookings" && <BookingsList items={bookings} />}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${active ? "bg-gold text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
      {icon}{children}
    </button>
  );
}

function MessagesList({ items }: { items: Submission[] }) {
  if (!items.length) return <Empty label="No messages yet." />;
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-medium">{m.name}</div>
              <a href={`mailto:${m.email}`} className="text-xs text-gold hover:underline">{m.email}</a>
              {m.subject && <div className="text-xs text-muted-foreground mt-1">{m.subject}</div>}
            </div>
            <time className="text-[11px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</time>
          </div>
          <p className="text-sm text-foreground/85 mt-3 whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

function BookingsList({ items }: { items: Booking[] }) {
  if (!items.length) return <Empty label="No bookings yet." />;
  return (
    <div className="space-y-3">
      {items.map((b) => (
        <div key={b.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-medium">{b.name} · <span className="text-gold">{b.service ?? "—"}</span></div>
              <a href={`mailto:${b.email}`} className="text-xs text-gold hover:underline">{b.email}</a>
              {b.phone && <span className="text-xs text-muted-foreground ml-2">{b.phone}</span>}
              <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                {b.budget && <span>Budget: {b.budget}</span>}
                {b.timeline && <span>Timeline: {b.timeline}</span>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-[0.2em] glass px-2 py-1 rounded-full">{b.status}</span>
              <time className="block text-[11px] text-muted-foreground mt-1">{new Date(b.created_at).toLocaleString()}</time>
            </div>
          </div>
          {b.details && <p className="text-sm text-foreground/85 mt-3 whitespace-pre-wrap">{b.details}</p>}
        </div>
      ))}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="glass-card rounded-2xl p-12 text-center text-sm text-muted-foreground">{label}</div>;
}

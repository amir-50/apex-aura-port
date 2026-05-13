import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/account" });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
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

        <div className="glass-card rounded-3xl p-8 mt-10 flex items-start gap-4">
          <ShieldCheck className="text-gold mt-1" size={28} />
          <div>
            <h2 className="font-display text-2xl">All controls live in the side panel</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Open the Admin panel (bottom-right floating button, or ⌘/Ctrl + Shift + A) to edit branding, sections, theme, SEO, manage subscription orders, packages, payment methods, users, and email settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

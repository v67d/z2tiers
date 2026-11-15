import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { GoogleButton } from "@/components/pctiers/GoogleButton";
import { StormBackdrop } from "@/components/pctiers/StormBackdrop";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — PCTIERS" },
      { name: "description", content: "Sign in to the PCTIERS admin panel to manage players and tiers." },
      { property: "og:title", content: "Admin Login — PCTIERS" },
      { property: "og:description", content: "Sign in to manage PCTIERS players and tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/admin", replace: true });
  }, [session, navigate]);

  async function signIn() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      setError("Google sign-in didn't finish. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <StormBackdrop />
      <div className="surface w-full max-w-md animate-float-up bg-card/80 p-8 backdrop-blur-xl">
        <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
          <ShieldCheck className="size-6" />
        </span>
        <p className="mt-6 font-pixel text-[11px] uppercase tracking-wider text-primary">Staff only</p>
        <h1 className="mt-2 text-3xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with an approved Gmail account to add players and manage their tiers.
        </p>
        <GoogleButton className="mt-8" onClick={signIn} disabled={busy} />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

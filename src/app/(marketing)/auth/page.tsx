"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

export default function AuthPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/account");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const p = params.get("next");
    if (p) setNextPath(p);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication is not configured.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?next=/account`,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Password reset email sent");
        setMode("signin");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Account created", {
          description: "Check your inbox if email confirmation is enabled.",
        });
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const hint =
          error.message === "Invalid login credentials"
            ? " No account yet? Tap “Create one” below to register first."
            : "";
        toast.error(`${error.message}${hint}`);
        return;
      }
      await fetch("/api/auth/bootstrap-profile", { method: "POST" });
      toast.success("Signed in");
      router.push(nextPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      toast.error("Authentication is not configured.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}` },
    });
    if (error) toast.error(error.message);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-glam-border bg-glam-secondary px-4 py-3 text-glam-primary outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent";

  return (
    <div className="section-padding !pt-10">
      <div className="mx-auto max-w-md">
        <Reveal>
          <div className="rounded-2xl border border-glam-border bg-glam-secondary p-8 shadow-soft sm:p-10">
            <SectionHeader
              eyebrow="Account"
              title={
                mode === "signin"
                  ? "Welcome Back"
                  : mode === "signup"
                    ? "Create Account"
                    : "Reset Password"
              }
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                />
              </label>
              {mode !== "forgot" ? (
                <label className="block text-sm font-medium">
                  Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </label>
              ) : null}
              <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign In"
                    : mode === "signup"
                      ? "Create Account"
                      : "Send Reset Link"}
              </Button>
            </form>

            {mode !== "forgot" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={signInWithGoogle}
              >
                Continue with Google
              </Button>
            ) : null}

            <div className="mt-6 space-y-2 text-center text-sm">
              {mode === "signin" ? (
                <>
                  <button
                    type="button"
                    className="text-glam-muted hover:text-glam-accent"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                  <p>
                    <button
                      type="button"
                      className="text-glam-muted hover:text-glam-accent"
                      onClick={() => setMode("signup")}
                    >
                      Need an account? Create one
                    </button>
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  className="text-glam-muted hover:text-glam-accent"
                  onClick={() => setMode("signin")}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

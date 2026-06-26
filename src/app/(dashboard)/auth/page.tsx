"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";

export default function AuthPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/admin");
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const p = params.get("next");
    if (p?.startsWith("/admin")) setNextPath(p);
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
          redirectTo: `${window.location.origin}/auth?next=/admin`,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Password reset email sent");
        setMode("signin");
        return;
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error("Sign in failed. Please try again.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.role !== "admin" && profile?.role !== "staff") {
        await supabase.auth.signOut();
        toast.error("This login is for Glam Room staff only.");
        return;
      }

      await fetch("/api/auth/bootstrap-profile", { method: "POST" });
      toast.success("Signed in");
      const destination =
        profile?.role === "staff" && (nextPath === "/admin" || nextPath === "/admin/")
          ? "/admin/appointments"
          : nextPath;
      router.push(destination);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-glam-accent focus:ring-1 focus:ring-glam-accent";

  return (
    <div className="w-full max-w-md">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-glam-accent">
        Internal access
      </p>
      <h1 className="font-display mt-3 text-3xl">
        {mode === "signin" ? "Staff sign in" : "Reset password"}
      </h1>
      <p className="mt-2 text-sm text-white/55">
        {BRAND.fullName} operations dashboard — not part of the public website.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
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
        {mode === "signin" ? (
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
        ) : null}
        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Send reset link"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === "signin" ? (
          <button
            type="button"
            className="text-white/55 hover:text-glam-accent"
            onClick={() => setMode("forgot")}
          >
            Forgot password?
          </button>
        ) : (
          <button
            type="button"
            className="text-white/55 hover:text-glam-accent"
            onClick={() => setMode("signin")}
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}

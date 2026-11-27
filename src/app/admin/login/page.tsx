"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import Notice from "@/components/ui/Notice";

export default function AdminLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const result = await api<{ role: string }>("/api/auth/login", "POST", {
        identifier,
        password,
        expectedRole: "admin",
      });

      if (result.role !== "admin") {
        throw new Error("This account is not authorized to access the Admin Portal.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Unable to sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="wrap max-w-md py-16">
      <form onSubmit={submit} className="card">
        <p className="mb-2 text-sm font-semibold text-gold">KBC SALOON ACADEMY</p>
        <h1 className="text-3xl font-bold">Admin <span className="text-gold">Login</span></h1>
        <p className="mb-5 mt-2 text-sm text-mute">Sign in with your administrator account.</p>

        <label className="label" htmlFor="admin-identifier">Admin email or phone</label>
        <input
          id="admin-identifier"
          className="input"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          required
        />

        <label className="label" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <Notice msg={error ? { ok: false, t: error } : null} />
        <button className="btn mt-3 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Login to Admin Portal"}
        </button>

        <p className="mt-4 text-center text-sm text-mute">
          <Link href="/" className="hover:text-gold">Back to home</Link>
        </p>
      </form>
    </div>
  );
}

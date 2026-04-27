"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // ❌ login fail
    if (!res || res.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    // ✅ กัน race condition (สำคัญสำหรับ Playwright)
    await new Promise((r) => setTimeout(r, 300));

    setLoading(false);

    // ✅ IMPORTANT: ใช้ replace + refresh แยก step
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-blue-100">

        <h2 className="mb-6 text-center text-3xl font-extrabold text-blue-900">
          Log In
        </h2>

        {error && (
          <p className="mb-4 text-center text-sm text-red-500 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              data-testid="email-input"
              name="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              data-testid="password-input"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            data-testid="login-button"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-bold"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register">
            <span className="text-blue-600 font-semibold">
              Register here
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}

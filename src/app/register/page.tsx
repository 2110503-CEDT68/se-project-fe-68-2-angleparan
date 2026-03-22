"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import userRegister from "@/libs/userRegister";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await userRegister(name, email, phone, password);
      const res = await signIn("credentials",{
        email,
        password,
        redirect: false
      })
      if (res?.error) {
        setError("Registered successfully, but failed to auto-login. Please log in manually.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-blue-100">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-blue-900">Create Account</h2>
        
        {error && <p className="mb-4 text-center text-sm text-red-500 font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="example@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="0XX-XXX-XXXX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 hover:shadow-lg font-bold mt-4 disabled:bg-blue-300 disabled:shadow-none"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login">
            <div className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                Back to Login
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
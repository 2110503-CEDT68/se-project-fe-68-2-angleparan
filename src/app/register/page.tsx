"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import userRegister from "@/libs/userRegister";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  
  // -- States หลัก --
  const [role, setRole] = useState<"user" | "dentist">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // -- States สำหรับหมอ --
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(9);
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(17);

  // -- States จัดการสถานะ --
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let dentistData = undefined;
      if (role === "dentist") {
        dentistData = {
          expertise,
          experience,
          workingHours: {
            start: workingHoursStart,
            end: workingHoursEnd
          }
        };
      }

      await userRegister(name, email, phone, password, role, dentistData);
      
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      
      if (res?.error) {
        setError("Registered successfully, but failed to auto-login. Please log in manually.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-500 text-sm">Join us and manage your dental care effortlessly</p>
        </div>

        {/* --- Tabs สำหรับเลือกว่าเป็น User หรือ Dentist --- */}
        <div className="flex p-1 mb-8 space-x-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "user"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("dentist")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "dentist"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Dentist
          </button>
        </div>
        
        {/* แสดง Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* --- ข้อมูลพื้นฐาน (ใช้ร่วมกัน) --- */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="0xx-xxx-xxxx"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="example@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Min. 6 characters"
              required
              minLength={6}
            />
          </div>

          {/* --- ข้อมูลเฉพาะของ Dentist --- */}
          {role === "dentist" && (
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Professional Info</h3>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expertise</label>
                <input
                  type="text"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="e.g. Pediatric Dentistry, Orthodontics"
                  required={role === "dentist"}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    required={role === "dentist"}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Working Hours</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={workingHoursStart}
                      onChange={(e) => setWorkingHoursStart(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      required={role === "dentist"}
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={workingHoursEnd}
                      onChange={(e) => setWorkingHoursEnd(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      required={role === "dentist"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-bold tracking-wide transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] mt-6 disabled:bg-blue-400 disabled:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
            Log in here
          </Link>
        </div>
        
      </div>
    </div>
  );
}
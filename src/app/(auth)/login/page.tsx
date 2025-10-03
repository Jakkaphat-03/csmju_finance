"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col space-y-5">
      <h1 className="text-3xl font-bold text-center text-green-400 mb-2">
        ระบบรายรับ - รายจ่าย
      </h1>
      <p className="text-center text-gray-400 text-sm mb-4">
        เข้าสู่ระบบเพื่อจัดการการเงินของคุณ
      </p>

      {error && <p className="text-red-400 text-center">{error}</p>}

      <div>
        <label className="block text-sm mb-1 text-gray-300">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-400 text-white"
          placeholder="กรอกอีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-300">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-400 text-white"
          placeholder="กรอกรหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold transition disabled:opacity-50"
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-gray-400 mt-4">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-green-400 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

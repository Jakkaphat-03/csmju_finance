import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-950 to-green-950">
      <div className="w-full max-w-md p-8 bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-green-700/40">
        {children}
      </div>
    </div>
  );
}

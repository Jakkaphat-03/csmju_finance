"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Footer from "@/components/Footer";

interface Transaction {
  id: number;
  type: "income" | "expense";
  account: string;
  date: string;
  category: string;
  amount: number;
  note?: string;
}

export default function ExpensePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) router.push("/login");
      else setUser(data.user);
    };
    getUser();
    fetchTransactions();
  }, [router]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
      .order("date", { ascending: false });
    if (data) setTransactions(data as Transaction[]);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

    setRemovingIds((prev) => [...prev, id]);
    setTimeout(async () => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) setTransactions((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => prev.filter((rid) => rid !== id));
    }, 300);
  };

  const grouped = transactions.reduce((acc: any, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 p-6 border-r border-gray-800 gap-4">
        <h2 className="text-lg font-bold text-green-400 mb-6">เมนู</h2>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400"
        >
          🏠 บัญชี
        </button>
        <button
          onClick={() => router.push("/income")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400"
        >
          💰 รายรับ
        </button>
        <button
          onClick={() => router.push("/expense")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-red-400"
        >
          🛒 รายจ่าย
        </button>

        <button onClick={() => router.push("/category")} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400">
          📂 หมวดหมู่
        </button>

        <button
          onClick={() => router.push("#")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400"
        >
          ⚙️ ตั้งค่า
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-xl shadow gap-4">
          <div>
            <h1 className="text-xl font-bold text-red-400">รายจ่าย</h1>
            {user && <p className="text-gray-400 text-sm">สวัสดี, {user.email}</p>}
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
          >
            ออกจากระบบ
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {Object.keys(grouped).map((date) => (
            <div key={date} className="bg-gray-900 p-6 rounded-xl shadow space-y-2">
              <h2 className="text-red-300 font-semibold">{date}</h2>
              <div className="space-y-2">
                {grouped[date].map((t: Transaction) => {
                  const isRemoving = removingIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={`flex justify-between items-center bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isRemoving ? "opacity-0 h-0 p-0 m-0" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium">{t.category}</p>
                        <p className="text-sm text-gray-400">{t.note}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-semibold">
                          -{t.amount.toLocaleString()} THB
                        </span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">ยังไม่มีรายการรายจ่าย</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

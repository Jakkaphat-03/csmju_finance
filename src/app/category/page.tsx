"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Wallet, ShoppingCart, Gift, Coffee, BookOpen } from "lucide-react";
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

// Map category to icon
const categoryIcons: { [key: string]: any } = {
  เงินเดือน: Wallet,
  ขายของออนไลน์: ShoppingCart,
  งานฟรีแลนซ์: Gift,
  ค่าอาหาร: Coffee,
  ค่าการศึกษา: BookOpen,
};

export default function CategoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) router.push("/login");
      else setUser(data.user);
      setLoading(false);
    };
    getUser();
    fetchTransactions();
  }, [router]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (data) setTransactions(data as Transaction[]);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

    setRemovingIds((prev) => [...prev, id]);

    setTimeout(async () => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (!error) setTransactions((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => prev.filter((rid) => rid !== id));
    }, 300);
  };

  if (loading)
    return <p className="text-white text-center mt-20">Loading...</p>;

  // Group by category
  const incomeGrouped = transactions
    .filter((t) => t.type === "income")
    .reduce((acc: any, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {});

  const expenseGrouped = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400"
        >
          🛒 รายจ่าย
        </button>
        <button
          onClick={() => router.push("/category")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-yellow-400"
        >
          📂 หมวดหมู่
        </button>

        <button
          onClick={() => router.push("#")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400"
        >
          ⚙️ ตั้งค่า
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-xl shadow gap-4">
          <h1 className="text-xl font-bold text-green-400">หมวดหมู่</h1>
          {user && (
            <p className="text-gray-400 text-sm">สวัสดี, {user.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* รายรับ */}
          <div className="bg-gray-900 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-lg font-bold text-green-400 mb-4">รายรับ</h2>
            {Object.keys(incomeGrouped).map((cat) => {
              const Icon = categoryIcons[cat] || Wallet;
              return (
                <div key={cat} className="bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} className="text-green-400" />
                    <span className="font-semibold text-green-300">{cat}</span>
                  </div>
                  {incomeGrouped[cat].map((t: Transaction) => {
                    const isRemoving = removingIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`flex justify-between items-center bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isRemoving ? "opacity-0 h-0 p-0 m-0" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm">
                            {t.account} | {t.date}
                          </p>
                          {t.note && (
                            <p className="text-xs text-gray-400">{t.note}</p>
                          )}
                        </div>
                        <div className="text-green-400 font-semibold">
                          +{t.amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* รายจ่าย */}
          <div className="bg-gray-900 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-lg font-bold text-red-400 mb-4">รายจ่าย</h2>
            {Object.keys(expenseGrouped).map((cat) => {
              const Icon = categoryIcons[cat] || ShoppingCart;
              return (
                <div key={cat} className="bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} className="text-red-400" />
                    <span className="font-semibold text-red-300">{cat}</span>
                  </div>
                  {expenseGrouped[cat].map((t: Transaction) => {
                    const isRemoving = removingIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`flex justify-between items-center bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isRemoving ? "opacity-0 h-0 p-0 m-0" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm">
                            {t.account} | {t.date}
                          </p>
                          {t.note && (
                            <p className="text-xs text-gray-400">{t.note}</p>
                          )}
                        </div>
                        <div className="text-red-400 font-semibold">
                          -{t.amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

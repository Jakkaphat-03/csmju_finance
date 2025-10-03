"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import Footer from "@/components/Footer";

interface Transaction {
  id: number;
  type: "income" | "expense";
  account: string;
  date: string;
  category: string;
  amount: number;
  note?: string;
  description?: string;
  created_at: string;
}

// ---------------------- Modal ----------------------
function TransactionModal({
  user,
  type,
  onClose,
  onSave,
}: {
  user: any;
  type: "income" | "expense";
  onClose: () => void;
  onSave: () => void;
}) {
  const [account, setAccount] = useState("กรุงไทย");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const incomeCategories = [
    "เงินเดือน",
    "ขายของออนไลน์",
    "งานฟรีแลนซ์",
    "อื่นๆ",
  ];
  const expenseCategories = [
    "ค่าอาหาร",
    "ค่าการศึกษา",
    "ค่าช้อปปิ้ง",
    "ค่าไฟ",
    "ค่าน้ำ",
    "ค่ารถ",
    "ค่าบ้าน",
    "ค่าสังสรรค์",
    "ภาษี",
    "บริจาค",
  ];

  const handleSave = async () => {
    if (!amount || !date || !category) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type,
        account,
        date,
        category,
        amount: parseFloat(amount),
        note,
      },
    ]);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ บันทึกสำเร็จ");
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-green-400">
          {type === "income" ? "เพิ่มรายรับใหม่" : "เพิ่มรายจ่ายใหม่"}
        </h2>

        {/* บัญชี */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">บัญชี</label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option>กรุงไทย</option>
            <option>กสิกร</option>
            <option>เงินสด</option>
          </select>
        </div>

        {/* วันที่ */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">วันที่</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">หมวดหมู่</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            {(type === "income" ? incomeCategories : expenseCategories).map(
              (cat) => (
                <option key={cat}>{cat}</option>
              )
            )}
          </select>
        </div>

        {/* จำนวนเงิน */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">จำนวนเงิน</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* โน้ต */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">โน้ต</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg ${
              type === "income"
                ? "bg-green-600 hover:bg-green-500"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------- Dashboard ----------------------
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const COLORS = ["#22c55e", "#ef4444"];

  const fetchTransactions = async () => {
    const { data } = await supabase.from("transactions").select("*");
    if (data) setTransactions(data as Transaction[]);
  };

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

  if (loading)
    return <p className="text-white text-center mt-20">Loading...</p>;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const pieData = [
    { name: "รายรับ", value: totalIncome },
    { name: "รายจ่าย", value: totalExpense },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 min-h-screen h-auto w-64 bg-gray-900 p-6 border-r border-gray-800 flex-col gap-6 transform transition-transform duration-300 z-50
  ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex`}
      >
        <button
          className="absolute top-4 right-4 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          ✖
        </button>

        <h2 className="text-lg font-bold text-green-400">เมนู</h2>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400">
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

        <button onClick={() => router.push("/category")} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400">
          📂 หมวดหมู่
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-green-400">
          ⚙️ ตั้งค่า
        </button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-xl shadow gap-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-bold text-green-400">
                รายรับ - รายจ่าย
              </h1>
              {user && (
                <p className="text-gray-400 text-sm">สวัสดี, {user.email}</p>
              )}
            </div>
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

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl text-center shadow">
            <p className="text-gray-400">รายรับ</p>
            <p className="text-green-400 text-3xl font-bold mt-2">
              THB {totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center shadow">
            <p className="text-gray-400">รายจ่าย</p>
            <p className="text-red-400 text-3xl font-bold mt-2">
              THB {totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* รายรับ */}
          <div className="bg-gray-900 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold text-green-400 mb-4">รายรับ</h3>
            <button
              className="w-full bg-green-600 py-2 rounded-lg mb-4 hover:bg-green-500"
              onClick={() => setShowIncomeModal(true)}
            >
              + New
            </button>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions
                .filter((t) => t.type === "income")
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between border-b border-gray-700 py-2"
                  >
                    <span>{t.description || t.category}</span>
                    <span className="text-green-400 font-semibold">
                      {t.amount}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* รายจ่าย */}
          <div className="bg-gray-900 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold text-red-400 mb-4">รายจ่าย</h3>
            <button
              className="w-full bg-red-600 py-2 rounded-lg mb-4 hover:bg-red-500"
              onClick={() => setShowExpenseModal(true)}
            >
              + New
            </button>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions
                .filter((t) => t.type === "expense")
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between border-b border-gray-700 py-2"
                  >
                    <span>{t.description || t.category}</span>
                    <span className="text-red-400 font-semibold">
                      {t.amount}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-900 p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-bold text-green-400 mb-6">
              สรุปการใช้จ่าย
            </h3>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showIncomeModal && (
          <TransactionModal
            user={user}
            type="income"
            onClose={() => setShowIncomeModal(false)}
            onSave={() => fetchTransactions()}
          />
        )}
        {showExpenseModal && (
          <TransactionModal
            user={user}
            type="expense"
            onClose={() => setShowExpenseModal(false)}
            onSave={() => fetchTransactions()}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

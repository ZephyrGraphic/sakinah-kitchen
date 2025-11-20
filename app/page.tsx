"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ChefHat,
  Lock,
  ArrowRight,
  X,
  MapPin,
  User,
  Phone,
  LogOut,
  PlusCircle,
  Edit,
  Star,
  UtensilsCrossed,
  Search,
  Menu,
  Sparkles,
  Send,
  Loader2,
} from "lucide-react";

// --- KONFIGURASI GEMINI API ---
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; // API Key akan diisi oleh environment runtime

// --- TIPE DATA ---
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isPopular?: boolean;
};

type CartItem = Product & { quantity: number };

type OrderForm = {
  name: string;
  address: string;
  phone: string;
  note: string;
  paymentMethod: "transfer" | "cod";
};

// --- MOCK DATA (Sesuai Banner) ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Cireng Isi Ayam Suwir",
    category: "Gorengan",
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    isPopular: true,
  },
  {
    id: "2",
    name: "Cireng Kuah Creamy",
    category: "Kuah",
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    isPopular: true,
  },
  {
    id: "3",
    name: "Cimol Bojot Pedas",
    category: "Gorengan",
    price: 12000,
    image:
      "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "Rice Bowl Ayam Teriyaki",
    category: "Berat",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "5",
    name: "Aneka Mochi Daifuku",
    category: "Manis",
    price: 10000,
    image:
      "https://images.unsplash.com/photo-1623595683280-d75267a98973?auto=format&fit=crop&w=600&q=80",
    isPopular: true,
  },
  {
    id: "6",
    name: "Aneka Snack Kering",
    category: "Gorengan",
    price: 8000,
    image:
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
  },
];

// --- UTILS ---
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

// --- APP UTAMA ---
export default function SakinahKitchenApp() {
  // State Navigasi & Data
  const [view, setView] = useState<
    "home" | "cart" | "checkout" | "admin-login" | "admin-dashboard"
  >("home");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // State AI Feature
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // State Form Checkout
  const [formData, setFormData] = useState<OrderForm>({
    name: "",
    address: "",
    phone: "",
    note: "",
    paymentMethod: "transfer",
  });

  // State Admin
  const [adminAuth, setAdminAuth] = useState({ user: "", pass: "" });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // --- LOGIC KERANJANG ---
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id)
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const totalCartPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- LOGIC WHATSAPP CHECKOUT (CORE) ---
  const handleCheckoutToWA = () => {
    const adminNumber = "6281563104784"; // NOMOR ADMIN SESUAI BANNER

    let message = `Halo *Sakinah Kitchen*, saya mau pesan jajan dong!%0A%0A`;
    message += `*Detail Pesanan:*%0A`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${
        item.quantity
      }x) - ${formatRupiah(item.price * item.quantity)}%0A`;
    });

    message += `%0A*Total: ${formatRupiah(totalCartPrice)}*%0A`;
    message += `--------------------------------%0A`;
    message += `*Data Pengiriman:*%0A`;
    message += `👤 Nama: ${formData.name}%0A`;
    message += `📱 No HP: ${formData.phone}%0A`;
    message += `📍 Alamat: ${formData.address}%0A`;
    message += `💳 Pembayaran: ${
      formData.paymentMethod === "transfer"
        ? "Transfer Bank"
        : "Bayar di Tempat (COD)"
    }%0A`;
    if (formData.note) message += `📝 Catatan: ${formData.note}%0A`;

    // Redirect ke WA
    window.open(`https://wa.me/${adminNumber}?text=${message}`, "_blank");

    // Bersihkan cart
    setCart([]);
    setView("home");
    setFormData({
      name: "",
      address: "",
      phone: "",
      note: "",
      paymentMethod: "transfer",
    });
  };

  // --- LOGIC GEMINI AI ---
  const handleAskAI = async () => {
    if (!aiMoodInput.trim()) return;

    setIsAILoading(true);
    setAiResponse(null);

    try {
      // Siapkan daftar menu untuk konteks AI
      const menuList = products
        .map(
          (p) =>
            `${p.name} (Kategori: ${p.category}, Harga: ${formatRupiah(
              p.price
            )})`
        )
        .join(", ");

      const systemPrompt = `
        Kamu adalah 'Sakinah Bot', asisten kuliner yang sangat gaul, lucu, dan akrab untuk brand 'Sakinah Kitchen'.
        
        Tugasmu:
        1. Analisa mood user: "${aiMoodInput}".
        2. Pilih SATU menu dari daftar berikut yang paling cocok untuk mood tersebut: [${menuList}].
        3. Berikan alasan yang lucu, pakai bahasa gaul Indonesia (pakai istilah kayak 'bestie', 'mengcapek', 'gaskeun', 'mantul'), dan emotikon yang banyak.
        4. Jangan sebutkan menu yang tidak ada di daftar.
        5. Jawaban harus singkat (maksimal 3 kalimat).
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Waduh, AI-nya lagi makan Cireng, coba tanya lagi ya!";
      setAiResponse(text);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setAiResponse(
        "Yah, koneksi putus nih bestie. Coba cek internet kamu ya!"
      );
    } finally {
      setIsAILoading(false);
    }
  };

  // Filter Produk
  const filteredProducts =
    selectedCategory === "Semua"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // --- COMPONENTS ---

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-amber-400 px-4 py-3 flex justify-between items-center shadow-md border-b-4 border-red-900">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setView("home")}
      >
        <div className="bg-white p-1.5 rounded-xl border-2 border-red-900 rotate-3 hover:rotate-0 transition-transform">
          <ChefHat size={24} className="text-red-900" />
        </div>
        <div className="leading-none">
          <h1 className="text-xl font-black text-red-900 tracking-tight">
            SAKINAH
          </h1>
          <p className="text-[10px] font-bold text-amber-100 bg-red-900 px-1 rounded inline-block">
            KITCHEN
          </p>
        </div>
      </div>

      <div
        className="relative cursor-pointer group"
        onClick={() => setIsCartOpen(true)}
      >
        <div className="bg-white p-2 rounded-xl border-2 border-red-900 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none transition hover:bg-amber-50">
          <ShoppingBag className="text-red-900" size={22} strokeWidth={2.5} />
        </div>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            {totalItems}
          </span>
        )}
      </div>
    </nav>
  );

  // --- VIEW: HOME ---
  if (view === "home")
    return (
      <div className="min-h-screen bg-amber-50 font-sans pb-24">
        <Navbar />

        {/* Hero Section - Curved Bottom */}
        <div className="relative bg-amber-400 pt-6 pb-16 px-4 rounded-b-[3rem] shadow-lg border-b-8 border-amber-500/30 mb-8 overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 bg-red-900 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-block bg-red-900 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-4 rotate-[-2deg] border-2 border-white shadow-md animate-pulse">
              MENERIMA PESANAN!!!
            </div>
            <h2 className="text-4xl font-black text-red-950 mb-2 leading-none drop-shadow-sm">
              ANEKA JAJANAN <br />
              <span
                className="text-white"
                style={{ textShadow: "2px 2px 0px #7f1d1d" }}
              >
                KEKINIAN
              </span>
            </h2>
            <p className="text-red-900/80 font-medium mb-6 text-sm max-w-xs mx-auto">
              Cireng, Cimol, Mochi, Rice Bowl. Semuanya enak, semuanya murah!
            </p>

            {/* AI SEARCH BUTTON */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="bg-white p-2 pr-4 rounded-2xl border-2 border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,0.2)] flex items-center gap-3 max-w-sm mx-auto transform hover:-translate-y-1 transition-transform duration-300 w-full justify-center group"
            >
              <div className="bg-amber-100 p-2 rounded-xl border border-amber-200">
                <Sparkles className="text-amber-600 animate-pulse" size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  Bingung mau jajan apa?
                </p>
                <p className="text-sm font-black text-red-900 group-hover:text-red-700">
                  Tanya Sakinah AI ✨
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 mb-6">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {["Semua", "Gorengan", "Kuah", "Manis", "Berat"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all shadow-sm
                ${
                  selectedCategory === cat
                    ? "bg-red-900 text-amber-400 border-red-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]"
                    : "bg-white text-red-900/60 border-amber-200 hover:border-red-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-2xl border-2 border-amber-200 hover:border-red-900 transition-all group shadow-sm hover:shadow-md flex flex-col h-full"
            >
              <div className="relative mb-3 rounded-xl overflow-hidden aspect-square bg-amber-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {item.isPopular && (
                  <span className="absolute top-2 left-2 bg-amber-400 text-red-900 text-[10px] font-black px-2 py-1 rounded border border-red-900 shadow-sm flex items-center gap-1">
                    <Star size={10} fill="#7f1d1d" /> HIT
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-red-950 text-sm leading-tight mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">
                  {item.category}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2 border-t-2 border-dashed border-amber-100">
                  <span className="font-black text-red-700 text-sm">
                    {formatRupiah(item.price)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-red-900 text-amber-400 p-1.5 rounded-lg hover:bg-red-800 active:scale-90 transition shadow-sm border-2 border-transparent hover:border-amber-400"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Simple */}
        <div className="mt-12 text-center pb-8">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-red-900"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>
          <p className="text-red-900/40 text-xs font-bold mb-2">
            © Sakinah Kitchen 2024
          </p>
          <button
            onClick={() => setView("admin-login")}
            className="text-[10px] text-amber-600 hover:underline font-medium"
          >
            Admin Login
          </button>
        </div>

        {/* AI MODAL OVERLAY */}
        {isAIModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-red-900/60 backdrop-blur-sm"
              onClick={() => setIsAIModalOpen(false)}
            />
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-amber-400 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-amber-400 p-4 flex justify-between items-center">
                <h3 className="font-black text-red-900 flex items-center gap-2 text-lg">
                  <Sparkles size={20} className="fill-red-900" /> SAKINAH AI
                </h3>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="bg-white/20 p-1 rounded hover:bg-white/40 text-red-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 mb-4">
                  <p className="text-sm text-red-900 font-medium">
                    👋 Hai Bestie! Lagi ngerasa apa hari ini? Ceritain dong,
                    nanti aku pilihin jajan yang pas!
                  </p>
                </div>

                {aiResponse && (
                  <div className="bg-white p-4 rounded-2xl border-2 border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,0.1)] mb-4 animate-in slide-in-from-bottom-2">
                    <p className="text-sm font-bold text-red-950 leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={aiMoodInput}
                    onChange={(e) => setAiMoodInput(e.target.value)}
                    placeholder="Misal: Lagi galau, pengen yang pedes..."
                    className="w-full p-3 pr-12 rounded-xl border-2 border-amber-300 focus:border-red-900 outline-none font-bold text-red-900 placeholder-red-900/30"
                    onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={isAILoading || !aiMoodInput.trim()}
                    className="absolute right-2 top-2 p-2 bg-red-900 text-amber-400 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
                  >
                    {isAILoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Drawer (Overlay) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div
              className="absolute inset-0 bg-red-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCartOpen(false)}
            />
            <div className="relative w-full max-w-md bg-amber-50 h-full shadow-2xl border-l-4 border-red-900 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 bg-amber-400 flex items-center justify-between border-b-4 border-red-900">
                <h2 className="text-xl font-black text-red-900 flex items-center gap-2">
                  <ShoppingBag size={24} /> KERANJANG
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-white text-red-900 p-1 rounded-lg border-2 border-red-900 hover:bg-red-100 transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <UtensilsCrossed size={64} className="text-red-900 mb-4" />
                    <p className="font-bold text-red-900">
                      Perut masih kosong nih.
                    </p>
                    <p className="text-xs text-red-800">
                      Yuk pilih jajanan dulu!
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border-2 border-amber-200 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                    >
                      <img
                        src={item.image}
                        className="w-14 h-14 rounded-lg object-cover border border-amber-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-red-900 text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-amber-600 text-xs font-bold">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1.5 hover:bg-amber-200 text-red-900 transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-red-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="p-1.5 hover:bg-amber-200 text-red-900 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white border-t-2 border-amber-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-red-900/60">
                    Total Bayar
                  </span>
                  <span className="text-2xl font-black text-red-900">
                    {formatRupiah(totalCartPrice)}
                  </span>
                </div>
                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setView("checkout");
                  }}
                  className="w-full bg-red-900 text-amber-400 py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 border-2 border-red-950"
                >
                  LANJUT PESAN <ArrowRight strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

  // --- VIEW: CHECKOUT ---
  if (view === "checkout")
    return (
      <div className="min-h-screen bg-amber-50 font-sans">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl border-x-2 border-amber-100 flex flex-col animate-in fade-in">
          {/* Header Checkout */}
          <div className="bg-amber-400 p-4 border-b-4 border-red-900 flex items-center gap-3 sticky top-0 z-10">
            <button
              onClick={() => setView("home")}
              className="bg-white p-1 rounded-lg border-2 border-red-900 text-red-900 active:scale-90 transition"
            >
              <ArrowRight className="rotate-180" strokeWidth={3} size={20} />
            </button>
            <h2 className="text-xl font-black text-red-900 uppercase">
              Formulir Pesanan
            </h2>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Summary Box */}
            <div className="bg-amber-100 rounded-xl p-4 border-2 border-amber-300 border-dashed">
              <h3 className="font-bold text-red-900 text-sm mb-2 flex items-center gap-2">
                <ShoppingBag size={16} /> Ringkasan ({totalItems} Item)
              </h3>
              <div className="flex justify-between items-end">
                <span className="text-xs text-red-900/70">
                  Total yang harus dibayar:
                </span>
                <span className="text-2xl font-black text-red-900">
                  {formatRupiah(totalCartPrice)}
                </span>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-red-900 uppercase mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Contoh: Kak Dinda"
                    className="w-full pl-10 p-3 bg-white rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-950 placeholder-amber-300 transition"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-red-900 uppercase mb-1.5">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <input
                    type="tel"
                    placeholder="0812..."
                    className="w-full pl-10 p-3 bg-white rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-950 placeholder-amber-300 transition"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-red-900 uppercase mb-1.5">
                  Alamat Pengiriman
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <textarea
                    placeholder="Jalan, No Rumah, Patokan..."
                    className="w-full pl-10 p-3 bg-white rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-950 placeholder-amber-300 transition min-h-[100px]"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-red-900 uppercase mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: "transfer" })
                    }
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition relative overflow-hidden ${
                      formData.paymentMethod === "transfer"
                        ? "bg-red-900 text-amber-400 border-red-900"
                        : "bg-white text-red-900/50 border-amber-200 hover:border-amber-400"
                    }`}
                  >
                    Transfer Bank
                    {formData.paymentMethod === "transfer" && (
                      <div className="absolute top-0 right-0 bg-amber-400 w-3 h-3 rounded-bl-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: "cod" })
                    }
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition relative overflow-hidden ${
                      formData.paymentMethod === "cod"
                        ? "bg-red-900 text-amber-400 border-red-900"
                        : "bg-white text-red-900/50 border-amber-200 hover:border-amber-400"
                    }`}
                  >
                    COD (Tunai)
                    {formData.paymentMethod === "cod" && (
                      <div className="absolute top-0 right-0 bg-amber-400 w-3 h-3 rounded-bl-full"></div>
                    )}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-red-900 uppercase mb-1.5">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Jangan pedas ya..."
                  className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-950 placeholder-amber-300 transition"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t-2 border-amber-100">
            <button
              onClick={handleCheckoutToWA}
              disabled={!formData.name || !formData.phone || !formData.address}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 border-2 border-green-800"
            >
              <MessageCircle size={24} strokeWidth={3} /> PESAN VIA WHATSAPP
            </button>
            <p className="text-center text-[10px] text-red-900/50 mt-3 font-bold">
              Pesanan akan dialihkan ke WhatsApp Admin (081563104784)
            </p>
          </div>
        </div>
      </div>
    );

  // --- VIEW: ADMIN LOGIN ---
  if (view === "admin-login")
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 animate-in zoom-in">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl border-4 border-red-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-900">
              <Lock className="text-red-900" size={32} />
            </div>
            <h2 className="text-2xl font-black text-red-900">ADMIN AREA</h2>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Sakinah Kitchen
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-900"
              onChange={(e) =>
                setAdminAuth({ ...adminAuth, user: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 focus:border-red-900 outline-none font-bold text-red-900"
              onChange={(e) =>
                setAdminAuth({ ...adminAuth, pass: e.target.value })
              }
            />
            <button
              onClick={() => {
                if (
                  adminAuth.user === "admin" &&
                  adminAuth.pass === "sakinah"
                ) {
                  setIsAdminLoggedIn(true);
                  setView("admin-dashboard");
                } else {
                  alert("Gagal! Coba: admin / sakinah");
                }
              }}
              className="w-full bg-red-900 text-amber-400 py-3 rounded-xl font-black hover:bg-red-800 transition"
            >
              MASUK
            </button>
            <button
              onClick={() => setView("home")}
              className="w-full text-xs font-bold text-red-900/50 hover:text-red-900"
            >
              KEMBALI KE MENU
            </button>
          </div>
        </div>
      </div>
    );

  // --- VIEW: ADMIN DASHBOARD ---
  if (view === "admin-dashboard" && isAdminLoggedIn)
    return (
      <div className="min-h-screen bg-amber-50 font-sans">
        <div className="bg-red-900 text-amber-400 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
          <h1 className="font-black text-xl tracking-tight">
            DASHBOARD SAKINAH
          </h1>
          <button
            onClick={() => setView("home")}
            className="text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 bg-red-800 px-3 py-1 rounded-lg"
          >
            <LogOut size={14} /> KELUAR
          </button>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-xl border-2 border-amber-200 shadow-sm">
              <span className="text-xs font-bold text-red-900/60 uppercase">
                Total Menu
              </span>
              <p className="text-2xl font-black text-red-900">
                {products.length}
              </p>
            </div>
            <button className="bg-amber-400 text-red-900 px-4 py-2 rounded-xl font-black border-2 border-red-900 shadow-[3px_3px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none flex items-center gap-2">
              <PlusCircle size={18} /> TAMBAH MENU
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-amber-100 text-red-900 border-b-2 border-amber-200">
                <tr>
                  <th className="p-4 font-black text-xs uppercase">Produk</th>
                  <th className="p-4 font-black text-xs uppercase">Kategori</th>
                  <th className="p-4 font-black text-xs uppercase">Harga</th>
                  <th className="p-4 font-black text-xs uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-200"
                      />
                      <span className="font-bold text-red-900 text-sm">
                        {p.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-red-900 text-sm">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg mr-1">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setProducts(products.filter((pr) => pr.id !== p.id))
                        }
                        className="text-red-600 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

  return null;
}

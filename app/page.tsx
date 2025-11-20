'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Minus, Trash2, MessageCircle, ChefHat, Lock, ArrowRight, X, MapPin, User, Phone, LogOut, PlusCircle, Edit, Star, UtensilsCrossed, Search, Sparkles, Send, Loader2, Save, Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";

// --- KONFIGURASI ---
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// GANTI DENGAN CONFIG DARI FIREBASE CONSOLE KAMU
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (Hanya jika config ada, untuk menghindari error saat build awal tanpa env)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
  paymentMethod: 'transfer' | 'cod';
};

// --- APP UTAMA ---
export default function SakinahKitchenApp() {
  // State Navigasi & Data
  const [view, setView] = useState<'home' | 'cart' | 'checkout' | 'admin-login' | 'admin-dashboard'>('home');
  const [products, setProducts] = useState<Product[]>([]); // Kosong awal, nanti diisi Firebase
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // State AI Feature
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // State Form Checkout
  const [formData, setFormData] = useState<OrderForm>({
    name: '', address: '', phone: '', note: '', paymentMethod: 'transfer'
  });

  // State Admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // State CRUD Produk (Admin)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Gorengan', price: '', image: '', isPopular: false
  });

  // --- EFFECT: Load Data & Auth Listener ---
  useEffect(() => {
    // 1. Listen User Login Status
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // 2. Listen Data Produk (Realtime)
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(items);
      setIsLoadingData(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setIsLoadingData(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, []);

  // --- LOGIC AUTHENTICATION ---
  const handleLogin = async () => {
    setIsAdminLoading(true);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      setView('admin-dashboard');
    } catch (error: any) {
      alert("Gagal Login: " + error.message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  // --- LOGIC CRUD PRODUK ---
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return alert("Nama dan Harga wajib diisi!");

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      image: productForm.image || 'https://via.placeholder.com/150?text=No+Image',
      isPopular: productForm.isPopular
    };

    try {
      if (editingProduct) {
        // Update
        await updateDoc(doc(db, "products", editingProduct.id), payload);
        alert("Menu berhasil diupdate!");
      } else {
        // Create
        await addDoc(collection(db, "products"), payload);
        alert("Menu baru berhasil ditambahkan!");
      }
      setIsProductFormOpen(false);
      resetProductForm();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Yakin mau hapus menu ini?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image: product.image,
      isPopular: product.isPopular || false
    });
    setIsProductFormOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: 'Gorengan', price: '', image: '', isPopular: false });
  };

  // --- LOGIC KERANJANG & WA ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutToWA = () => {
    const adminNumber = "6281563104784"; 
    let message = `Halo *Sakinah Kitchen*, saya mau pesan jajan dong!%0A%0A*Detail Pesanan:*%0A`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}x) - ${formatRupiah(item.price * item.quantity)}%0A`;
    });
    message += `%0A*Total: ${formatRupiah(totalCartPrice)}*%0A--------------------------------%0A*Data Pengiriman:*%0A`;
    message += `👤 Nama: ${formData.name}%0A📱 No HP: ${formData.phone}%0A📍 Alamat: ${formData.address}%0A💳 Pembayaran: ${formData.paymentMethod === 'transfer' ? 'Transfer Bank' : 'COD'}%0A`;
    if (formData.note) message += `📝 Catatan: ${formData.note}%0A`;
    
    window.open(`https://wa.me/${adminNumber}?text=${message}`, '_blank');
    setCart([]); setView('home');
  };

  // --- LOGIC GEMINI AI ---
  const handleAskAI = async () => {
    if (!aiMoodInput.trim()) return;
    setIsAILoading(true); setAiResponse(null);
    try {
      const menuList = products.map(p => `${p.name} (${p.category}, ${formatRupiah(p.price)})`).join(', ');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Role: Asisten 'Sakinah Kitchen' yang gaul. User mood: "${aiMoodInput}". Pilih 1 menu dari: [${menuList}]. Jawab lucu & singkat.` }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "AI lagi ngemil, coba lagi ya!");
    } catch (error) { setAiResponse("Koneksi error nih bestie!"); } finally { setIsAILoading(false); }
  };

  // Utils
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const filteredProducts = selectedCategory === 'Semua' ? products : products.filter(p => p.category === selectedCategory);

  // --- COMPONENTS ---
  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-amber-400 px-4 py-3 flex justify-between items-center shadow-md border-b-4 border-red-900">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-white p-1.5 rounded-xl border-2 border-red-900 -rotate-3 hover:rotate-0 transition-transform"><ChefHat size={24} className="text-red-900" /></div>
        <div className="leading-none"><h1 className="text-xl font-black text-red-900 tracking-tight">SAKINAH</h1><p className="text-[10px] font-bold text-amber-100 bg-red-900 px-1 rounded inline-block">KITCHEN</p></div>
      </div>
      <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
        <div className="bg-white p-2 rounded-xl border-2 border-red-900 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none transition hover:bg-amber-50"><ShoppingBag className="text-red-900" size={22} /></div>
        {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{totalItems}</span>}
      </div>
    </nav>
  );

  // --- VIEWS ---
  if (view === 'admin-login') return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 animate-in zoom-in">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border-4 border-red-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-900"><Lock className="text-red-900" size={32} /></div>
          <h2 className="text-2xl font-black text-red-900">ADMIN LOGIN</h2>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email Admin" className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 outline-none font-bold text-red-900" onChange={e => setAdminEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-3 bg-amber-50 rounded-xl border-2 border-amber-200 outline-none font-bold text-red-900" onChange={e => setAdminPass(e.target.value)} />
          <button onClick={handleLogin} disabled={isAdminLoading} className="w-full bg-red-900 text-amber-400 py-3 rounded-xl font-black hover:bg-red-800 transition">{isAdminLoading ? 'LOADING...' : 'MASUK'}</button>
          <button onClick={() => setView('home')} className="w-full text-xs font-bold text-red-900/50 hover:text-red-900">KEMBALI KE MENU</button>
        </div>
      </div>
    </div>
  );

  if (view === 'admin-dashboard') return (
    <div className="min-h-screen bg-amber-50 font-sans pb-20">
      <div className="bg-red-900 text-amber-400 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <h1 className="font-black text-xl tracking-tight">DASHBOARD</h1>
        <button onClick={handleLogout} className="bg-red-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-700"><LogOut size={14} /> KELUAR</button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white px-4 py-2 rounded-xl border-2 border-amber-200 shadow-sm"><span className="text-xs font-bold text-red-900/60 uppercase">Total Menu</span><p className="text-2xl font-black text-red-900">{products.length}</p></div>
          <button onClick={() => { resetProductForm(); setIsProductFormOpen(true); }} className="bg-amber-400 text-red-900 px-4 py-2 rounded-xl font-black border-2 border-red-900 shadow-[3px_3px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none flex items-center gap-2"><PlusCircle size={18} /> TAMBAH MENU</button>
        </div>

        {/* LIST PRODUK */}
        <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-amber-100 text-red-900 border-b-2 border-amber-200"><tr><th className="p-4 font-black text-xs uppercase">Produk</th><th className="p-4 font-black text-xs uppercase hidden md:table-cell">Harga</th><th className="p-4 font-black text-xs uppercase text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-amber-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-amber-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover border border-amber-200 bg-gray-100" />
                    <div><span className="font-bold text-red-900 text-sm block">{p.name}</span><span className="text-[10px] bg-amber-200 px-1.5 rounded text-red-900 font-bold">{p.category}</span></div>
                  </td>
                  <td className="p-4 font-bold text-red-900 text-sm hidden md:table-cell">{formatRupiah(p.price)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditForm(p)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg mr-1"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="p-8 text-center text-gray-400 font-bold">Belum ada menu. Tambahkan sekarang!</div>}
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsProductFormOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative border-4 border-amber-400 animate-in zoom-in-95">
            <h3 className="font-black text-xl text-red-900 mb-4 flex items-center gap-2">{editingProduct ? <Edit size={24}/> : <PlusCircle size={24}/>} {editingProduct ? 'EDIT MENU' : 'TAMBAH MENU BARU'}</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-red-900">Nama Menu</label><input type="text" className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none focus:border-red-900 font-bold" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-red-900">Kategori</label><select className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none font-bold" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>{['Gorengan','Kuah','Manis','Berat'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-bold text-red-900">Harga</label><input type="number" className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none font-bold" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} /></div>
              </div>
              <div><label className="text-xs font-bold text-red-900">Link Gambar (URL)</label><div className="flex gap-2"><ImageIcon className="text-gray-400"/><input type="text" placeholder="https://..." className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none text-sm" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} /></div></div>
              <div className="flex items-center gap-2 pt-2"><input type="checkbox" id="popular" className="w-5 h-5 accent-red-900" checked={productForm.isPopular} onChange={e => setProductForm({...productForm, isPopular: e.target.checked})} /><label htmlFor="popular" className="font-bold text-red-900 text-sm">Menu Favorit (Best Seller)?</label></div>
              <button onClick={handleSaveProduct} className="w-full bg-red-900 text-amber-400 py-3 rounded-xl font-black hover:bg-red-800 mt-4 flex justify-center items-center gap-2"><Save size={18}/> SIMPAN MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- VIEW: PUBLIC HOME, CART, CHECKOUT (Sama seperti sebelumnya, disederhanakan) ---
  if (view === 'home' || view === 'cart' || view === 'checkout') {
    // (Kode UI Frontend sama, hanya replace map products dengan filteredProducts dari state)
    return (
      <div className="min-h-screen bg-amber-50 font-sans pb-24">
        <Navbar />
        {view === 'home' && (
          <>
            <div className="relative bg-amber-400 pt-6 pb-16 px-4 rounded-b-[3rem] shadow-lg border-b-8 border-amber-500/30 mb-8 overflow-hidden">
               <div className="relative z-10 text-center">
                  <div className="inline-block bg-red-900 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-4 rotate-[-2deg] border-2 border-white shadow-md animate-pulse">MENERIMA PESANAN!!!</div>
                  <h2 className="text-4xl font-black text-red-950 mb-2 leading-none drop-shadow-sm">ANEKA JAJANAN <br/><span className="text-white" style={{ textShadow: '2px 2px 0px #7f1d1d' }}>KEKINIAN</span></h2>
                  <button onClick={() => setIsAIModalOpen(true)} className="bg-white p-2 pr-4 rounded-2xl border-2 border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,0.2)] flex items-center gap-3 max-w-sm mx-auto mt-6 transform hover:-translate-y-1 transition-transform duration-300 w-full justify-center group">
                    <div className="bg-amber-100 p-2 rounded-xl border border-amber-200"><Sparkles className="text-amber-600 animate-pulse" size={20} /></div>
                    <div className="text-left"><p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Bingung mau jajan apa?</p><p className="text-sm font-black text-red-900 group-hover:text-red-700">Tanya Sakinah AI ✨</p></div>
                  </button>
               </div>
            </div>

            <div className="px-4 mb-6 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">{['Semua', 'Gorengan', 'Kuah', 'Manis', 'Berat'].map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${selectedCategory === cat ? 'bg-red-900 text-amber-400 border-red-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]' : 'bg-white text-red-900/60 border-amber-200 hover:border-red-900'}`}>{cat}</button>))}</div>

            {isLoadingData ? (
               <div className="text-center py-20 text-red-900/50 font-bold animate-pulse">Loading Menu...</div>
            ) : (
              <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-2xl border-2 border-amber-200 hover:border-red-900 transition-all group shadow-sm hover:shadow-md flex flex-col h-full">
                    <div className="relative mb-3 rounded-xl overflow-hidden aspect-square bg-amber-100"><img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />{item.isPopular && <span className="absolute top-2 left-2 bg-amber-400 text-red-900 text-[10px] font-black px-2 py-1 rounded border border-red-900 shadow-sm flex items-center gap-1"><Star size={10} fill="#7f1d1d" /> HIT</span>}</div>
                    <div className="flex flex-col flex-1"><h3 className="font-bold text-red-950 text-sm leading-tight mb-1 line-clamp-2">{item.name}</h3><p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">{item.category}</p><div className="mt-auto flex items-center justify-between pt-2 border-t-2 border-dashed border-amber-100"><span className="font-black text-red-700 text-sm">{formatRupiah(item.price)}</span><button onClick={() => addToCart(item)} className="bg-red-900 text-amber-400 p-1.5 rounded-lg hover:bg-red-800 active:scale-90 transition shadow-sm border-2 border-transparent hover:border-amber-400"><Plus size={18} strokeWidth={3} /></button></div></div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 text-center pb-8"><button onClick={() => setView('admin-login')} className="text-[10px] text-amber-600 hover:underline font-medium">Admin Login</button></div>
          </>
        )}

        {/* CART DRAWER */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-md bg-amber-50 h-full shadow-2xl border-l-4 border-red-900 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 bg-amber-400 flex items-center justify-between border-b-4 border-red-900"><h2 className="text-xl font-black text-red-900 flex items-center gap-2"><ShoppingBag size={24} /> KERANJANG</h2><button onClick={() => setIsCartOpen(false)} className="bg-white text-red-900 p-1 rounded-lg border-2 border-red-900 hover:bg-red-100"><X size={20} strokeWidth={3} /></button></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? <div className="text-center opacity-50 py-20"><UtensilsCrossed size={64} className="mx-auto mb-4 text-red-900" /><p className="font-bold text-red-900">Kosong nih...</p></div> : cart.map(item => (<div key={item.id} className="bg-white p-3 rounded-xl border-2 border-amber-200 flex items-center gap-3 shadow-sm"><img src={item.image} className="w-14 h-14 rounded-lg object-cover border border-amber-200" /><div className="flex-1"><h4 className="font-bold text-red-900 text-sm line-clamp-1">{item.name}</h4><p className="text-amber-600 text-xs font-bold">{formatRupiah(item.price)}</p></div><div className="flex items-center bg-amber-50 rounded-lg border border-amber-200"><button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-red-900"><Minus size={14} strokeWidth={3}/></button><span className="w-6 text-center text-xs font-bold text-red-900">{item.quantity}</span><button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-red-900"><Plus size={14} strokeWidth={3}/></button></div></div>))}
              </div>
              <div className="p-4 bg-white border-t-2 border-amber-200"><div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-red-900/60">Total Bayar</span><span className="text-2xl font-black text-red-900">{formatRupiah(totalCartPrice)}</span></div><button disabled={cart.length === 0} onClick={() => { setIsCartOpen(false); setView('checkout'); }} className="w-full bg-red-900 text-amber-400 py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] border-2 border-red-950 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50">LANJUT PESAN <ArrowRight className="inline" strokeWidth={3} /></button></div>
            </div>
          </div>
        )}

        {/* CHECKOUT VIEW */}
        {view === 'checkout' && (
          <div className="fixed inset-0 z-50 bg-amber-50 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl border-x-2 border-amber-100 flex flex-col">
               <div className="bg-amber-400 p-4 border-b-4 border-red-900 flex items-center gap-3 sticky top-0 z-10"><button onClick={() => setView('home')} className="bg-white p-1 rounded-lg border-2 border-red-900 text-red-900"><ArrowRight className="rotate-180" strokeWidth={3} size={20} /></button><h2 className="text-xl font-black text-red-900 uppercase">Checkout</h2></div>
               <div className="p-6 space-y-6">
                  <div className="bg-amber-100 rounded-xl p-4 border-2 border-amber-300 border-dashed"><h3 className="font-bold text-red-900 text-sm mb-2 flex items-center gap-2"><ShoppingBag size={16} /> Ringkasan ({totalItems} Item)</h3><div className="flex justify-between items-end"><span className="text-xs text-red-900/70">Total:</span><span className="text-2xl font-black text-red-900">{formatRupiah(totalCartPrice)}</span></div></div>
                  <div className="space-y-4">
                    <div><label className="text-xs font-bold text-red-900 uppercase">Nama</label><input type="text" className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-red-900 uppercase">No WA</label><input type="tel" className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-red-900 uppercase">Alamat</label><textarea className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-3"><button onClick={() => setFormData({...formData, paymentMethod: 'transfer'})} className={`p-3 rounded-xl border-2 font-bold text-sm ${formData.paymentMethod === 'transfer' ? 'bg-red-900 text-amber-400 border-red-900' : 'bg-white text-gray-400 border-amber-200'}`}>Transfer</button><button onClick={() => setFormData({...formData, paymentMethod: 'cod'})} className={`p-3 rounded-xl border-2 font-bold text-sm ${formData.paymentMethod === 'cod' ? 'bg-red-900 text-amber-400 border-red-900' : 'bg-white text-gray-400 border-amber-200'}`}>COD</button></div>
                  </div>
                  <button onClick={handleCheckoutToWA} disabled={!formData.name || !formData.phone || !formData.address} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] border-2 border-green-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex justify-center items-center gap-2"><MessageCircle size={24} strokeWidth={3} /> PESAN WA</button>
               </div>
            </div>
          </div>
        )}

        {/* AI MODAL */}
        {isAIModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"><div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm" onClick={() => setIsAIModalOpen(false)} /><div className="bg-white w-full max-w-md rounded-3xl border-4 border-amber-400 shadow-2xl relative overflow-hidden animate-in zoom-in-95"><div className="bg-amber-400 p-4 flex justify-between items-center"><h3 className="font-black text-red-900 flex items-center gap-2 text-lg"><Sparkles size={20} className="fill-red-900" /> SAKINAH AI</h3><button onClick={() => setIsAIModalOpen(false)} className="bg-white/20 p-1 rounded hover:bg-white/40 text-red-900"><X size={20} /></button></div><div className="p-6"><div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 mb-4"><p className="text-sm text-red-900 font-medium">👋 Hai Bestie! Lagi ngerasa apa hari ini?</p></div>{aiResponse && <div className="bg-white p-4 rounded-2xl border-2 border-red-900 mb-4"><p className="text-sm font-bold text-red-950">{aiResponse}</p></div>}<div className="relative"><input type="text" value={aiMoodInput} onChange={(e) => setAiMoodInput(e.target.value)} placeholder="Misal: Lagi galau..." className="w-full p-3 pr-12 rounded-xl border-2 border-amber-300 outline-none font-bold text-red-900" onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} /><button onClick={handleAskAI} disabled={isAILoading || !aiMoodInput.trim()} className="absolute right-2 top-2 p-2 bg-red-900 text-amber-400 rounded-lg hover:bg-red-800 disabled:opacity-50">{isAILoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button></div></div></div></div>
        )}
      </div>
    );
  }

  return null;
}
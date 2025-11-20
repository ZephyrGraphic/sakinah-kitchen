"use client";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

import { useState } from "react";
import type { ViewType, OrderForm, Product, ProductForm } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAI } from "@/hooks/useAI";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import HomeView from "@/views/HomeView";
import CheckoutView from "@/views/CheckoutView";
import AdminLoginView from "@/views/AdminLoginView";
import AdminDashboardView from "@/views/AdminDashboardView";

export default function SakinahKitchenApp() {
  // State Navigation
  const [view, setView] = useState<ViewType>("home");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Hooks
  const { currentUser, login, logout } = useAuth();
  const {
    products,
    isLoading: isLoadingProducts,
    saveProduct,
    deleteProduct,
  } = useProducts();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQty,
    totalCartPrice,
    totalItems,
    clearCart,
  } = useCart();
  const {
    isAIModalOpen,
    setIsAIModalOpen,
    aiMoodInput,
    setAiMoodInput,
    aiResponse,
    isAILoading,
    handleAskAI,
  } = useAI(products);

  // State Form Checkout
  const [formData, setFormData] = useState<OrderForm>({
    name: "",
    address: "",
    phone: "",
    note: "",
    paymentMethod: "transfer",
  });

  // State Admin
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // State CRUD Produk (Admin)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    category: "Gorengan",
    price: "",
    image: "",
    isPopular: false,
  });

  // --- LOGIC AUTHENTICATION ---
  const handleLogin = async () => {
    setIsAdminLoading(true);
    try {
      await login(adminEmail, adminPass);
      setView("admin-dashboard");
    } catch (error: any) {
      alert("Gagal Login: " + error.message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setView("home");
  };

  // --- LOGIC CRUD PRODUK ---
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      return alert("Nama dan Harga wajib diisi!");
    }

    try {
      await saveProduct(productForm, editingProduct);
      alert(
        editingProduct
          ? "Menu berhasil diupdate!"
          : "Menu baru berhasil ditambahkan!"
      );
      setIsProductFormOpen(false);
      resetProductForm();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Yakin mau hapus menu ini?")) {
      await deleteProduct(id);
    }
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image: product.image,
      isPopular: product.isPopular || false,
    });
    setIsProductFormOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Gorengan",
      price: "",
      image: "",
      isPopular: false,
    });
  };

  // --- LOGIC WHATSAPP CHECKOUT ---
  const handleCheckoutToWA = () => {
    const adminNumber = "6281563104784";

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

    window.open(`https://wa.me/${adminNumber}?text=${message}`, "_blank");

    clearCart();
    setView("home");
    setFormData({
      name: "",
      address: "",
      phone: "",
      note: "",
      paymentMethod: "transfer",
    });
  };

  // --- VIEWS ---
  if (view === "admin-login") {
    return (
      <AdminLoginView
        email={adminEmail}
        password={adminPass}
        isLoading={isAdminLoading}
        onEmailChange={setAdminEmail}
        onPasswordChange={setAdminPass}
        onLogin={handleLogin}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "admin-dashboard") {
    return (
      <AdminDashboardView
        products={products}
        onLogout={handleLogout}
        onAddProduct={() => {
          resetProductForm();
          setIsProductFormOpen(true);
        }}
        isProductFormOpen={isProductFormOpen}
        onCloseProductForm={() => setIsProductFormOpen(false)}
        productForm={productForm}
        onProductFormChange={setProductForm}
        editingProduct={editingProduct}
        onSaveProduct={handleSaveProduct}
        onEditProduct={openEditForm}
        onDeleteProduct={handleDeleteProduct}
      />
    );
  }

  // --- VIEW: PUBLIC HOME, CART, CHECKOUT ---
  return (
    <div className="min-h-screen bg-amber-50 font-sans pb-24">
      <Navbar
        onHomeClick={() => setView("home")}
        onCartClick={() => setIsCartOpen(true)}
        totalItems={totalItems}
      />

      {view === "home" && (
        <HomeView
          products={products}
          isLoading={isLoadingProducts}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onAddToCart={addToCart}
          onOpenAI={() => setIsAIModalOpen(true)}
          onAdminLogin={() => setView("admin-login")}
          isAIModalOpen={isAIModalOpen}
          onCloseAI={() => setIsAIModalOpen(false)}
          aiMoodInput={aiMoodInput}
          onAIInputChange={setAiMoodInput}
          aiResponse={aiResponse}
          isAILoading={isAILoading}
          onAskAI={handleAskAI}
        />
      )}

      {view === "checkout" && (
        <CheckoutView
          formData={formData}
          onFormChange={setFormData}
          totalCartPrice={totalCartPrice}
          totalItems={totalItems}
          onBack={() => setView("home")}
          onCheckout={handleCheckoutToWA}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        totalCartPrice={totalCartPrice}
        totalItems={totalItems}
        onCheckout={() => {
          setIsCartOpen(false);
          setView("checkout");
        }}
      />
    </div>
  );
}

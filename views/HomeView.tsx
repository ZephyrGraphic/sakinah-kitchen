"use client";

import { Sparkles } from "lucide-react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import AIModal from "@/components/AIModal";

interface HomeViewProps {
  products: Product[];
  isLoading: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onOpenAI: () => void;
  onAdminLogin: () => void;
  // AI Modal props
  isAIModalOpen: boolean;
  onCloseAI: () => void;
  aiMoodInput: string;
  onAIInputChange: (value: string) => void;
  aiResponse: string | null;
  isAILoading: boolean;
  onAskAI: () => void;
}

export default function HomeView({
  products,
  isLoading,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onOpenAI,
  onAdminLogin,
  isAIModalOpen,
  onCloseAI,
  aiMoodInput,
  onAIInputChange,
  aiResponse,
  isAILoading,
  onAskAI,
}: HomeViewProps) {
  const filteredProducts =
    selectedCategory === "Semua"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <div className="relative bg-amber-400 pt-6 pb-16 px-4 rounded-b-[3rem] shadow-lg border-b-8 border-amber-500/30 mb-8 overflow-hidden">
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
          <button
            onClick={onOpenAI}
            className="bg-white p-2 pr-4 rounded-2xl border-2 border-red-900 shadow-[4px_4px_0px_0px_rgba(127,29,29,0.2)] flex items-center gap-3 max-w-sm mx-auto mt-6 transform hover:-translate-y-1 transition-transform duration-300 w-full justify-center group"
          >
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-200">
              <Sparkles
                className="text-amber-600 animate-pulse"
                size={20}
              />
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

      <div className="px-4 mb-6 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {["Semua", "Gorengan", "Kuah", "Manis", "Berat"].map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${
              selectedCategory === cat
                ? "bg-red-900 text-amber-400 border-red-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]"
                : "bg-white text-red-900/60 border-amber-200 hover:border-red-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-red-900/50 font-bold animate-pulse">
          Loading Menu...
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-center pb-8">
        <button
          onClick={onAdminLogin}
          className="text-[10px] text-amber-600 hover:underline font-medium"
        >
          Admin Login
        </button>
      </div>

      <AIModal
        isOpen={isAIModalOpen}
        onClose={onCloseAI}
        aiMoodInput={aiMoodInput}
        onInputChange={onAIInputChange}
        aiResponse={aiResponse}
        isAILoading={isAILoading}
        onAskAI={onAskAI}
      />
    </>
  );
}


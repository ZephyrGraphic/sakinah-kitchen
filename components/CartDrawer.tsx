"use client";

import { ShoppingBag, X, Plus, Minus, ArrowRight, UtensilsCrossed } from "lucide-react";
import type { CartItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  totalCartPrice: number;
  totalItems: number;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  totalCartPrice,
  totalItems,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-red-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-amber-50 h-full shadow-2xl border-l-4 border-red-900 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 bg-amber-400 flex items-center justify-between border-b-4 border-red-900">
          <h2 className="text-xl font-black text-red-900 flex items-center gap-2">
            <ShoppingBag size={24} /> KERANJANG
          </h2>
          <button
            onClick={onClose}
            className="bg-white text-red-900 p-1 rounded-lg border-2 border-red-900 hover:bg-red-100"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center opacity-50 py-20">
              <UtensilsCrossed
                size={64}
                className="mx-auto mb-4 text-red-900"
              />
              <p className="font-bold text-red-900">Kosong nih...</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl border-2 border-amber-200 flex items-center gap-3 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
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
                <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="p-1.5 text-red-900"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-red-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="p-1.5 text-red-900"
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
            onClick={onCheckout}
            className="w-full bg-red-900 text-amber-400 py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] border-2 border-red-950 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
          >
            LANJUT PESAN <ArrowRight className="inline" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}


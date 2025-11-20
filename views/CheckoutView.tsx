"use client";

import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react";
import type { OrderForm } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface CheckoutViewProps {
  formData: OrderForm;
  onFormChange: (form: OrderForm) => void;
  totalCartPrice: number;
  totalItems: number;
  onBack: () => void;
  onCheckout: () => void;
}

export default function CheckoutView({
  formData,
  onFormChange,
  totalCartPrice,
  totalItems,
  onBack,
  onCheckout,
}: CheckoutViewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-amber-50 overflow-y-auto">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl border-x-2 border-amber-100 flex flex-col">
        <div className="bg-amber-400 p-4 border-b-4 border-red-900 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={onBack}
            className="bg-white p-1 rounded-lg border-2 border-red-900 text-red-900"
          >
            <ArrowRight className="rotate-180" strokeWidth={3} size={20} />
          </button>
          <h2 className="text-xl font-black text-red-900 uppercase">Checkout</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-amber-100 rounded-xl p-4 border-2 border-amber-300 border-dashed">
            <h3 className="font-bold text-red-900 text-sm mb-2 flex items-center gap-2">
              <ShoppingBag size={16} /> Ringkasan ({totalItems} Item)
            </h3>
            <div className="flex justify-between items-end">
              <span className="text-xs text-red-900/70">Total:</span>
              <span className="text-2xl font-black text-red-900">
                {formatRupiah(totalCartPrice)}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-red-900 uppercase">Nama</label>
              <input
                type="text"
                className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold"
                value={formData.name}
                onChange={(e) =>
                  onFormChange({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-900 uppercase">No WA</label>
              <input
                type="tel"
                className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold"
                value={formData.phone}
                onChange={(e) =>
                  onFormChange({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-900 uppercase">Alamat</label>
              <textarea
                className="w-full p-3 bg-white rounded-xl border-2 border-amber-200 font-bold"
                value={formData.address}
                onChange={(e) =>
                  onFormChange({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  onFormChange({ ...formData, paymentMethod: "transfer" })
                }
                className={`p-3 rounded-xl border-2 font-bold text-sm ${
                  formData.paymentMethod === "transfer"
                    ? "bg-red-900 text-amber-400 border-red-900"
                    : "bg-white text-gray-400 border-amber-200"
                }`}
              >
                Transfer
              </button>
              <button
                onClick={() => onFormChange({ ...formData, paymentMethod: "cod" })}
                className={`p-3 rounded-xl border-2 font-bold text-sm ${
                  formData.paymentMethod === "cod"
                    ? "bg-red-900 text-amber-400 border-red-900"
                    : "bg-white text-gray-400 border-amber-200"
                }`}
              >
                COD
              </button>
            </div>
          </div>
          <button
            onClick={onCheckout}
            disabled={!formData.name || !formData.phone || !formData.address}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] border-2 border-green-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <MessageCircle size={24} strokeWidth={3} /> PESAN WA
          </button>
        </div>
      </div>
    </div>
  );
}


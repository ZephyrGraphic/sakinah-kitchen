"use client";

import { PlusCircle, Edit, Save, Image as ImageIcon } from "lucide-react";
import type { Product, ProductForm } from "@/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productForm: ProductForm;
  onFormChange: (form: ProductForm) => void;
  editingProduct: Product | null;
  onSave: () => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  productForm,
  onFormChange,
  editingProduct,
  onSave,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative border-4 border-amber-400 animate-in zoom-in-95">
        <h3 className="font-black text-xl text-red-900 mb-4 flex items-center gap-2">
          {editingProduct ? <Edit size={24} /> : <PlusCircle size={24} />}{" "}
          {editingProduct ? "EDIT MENU" : "TAMBAH MENU BARU"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-red-900">Nama Menu</label>
            <input
              type="text"
              className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none focus:border-red-900 font-bold"
              value={productForm.name}
              onChange={(e) =>
                onFormChange({ ...productForm, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-red-900">Kategori</label>
              <select
                className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none font-bold"
                value={productForm.category}
                onChange={(e) =>
                  onFormChange({ ...productForm, category: e.target.value })
                }
              >
                {["Gorengan", "Kuah", "Manis", "Berat"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-red-900">Harga</label>
              <input
                type="number"
                className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none font-bold"
                value={productForm.price}
                onChange={(e) =>
                  onFormChange({ ...productForm, price: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-red-900">
              Link Gambar (URL)
            </label>
            <div className="flex gap-2">
              <ImageIcon className="text-gray-400" />
              <input
                type="text"
                placeholder="https://..."
                className="w-full p-2 border-2 border-amber-200 rounded-lg outline-none text-sm"
                value={productForm.image}
                onChange={(e) =>
                  onFormChange({ ...productForm, image: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="popular"
              className="w-5 h-5 accent-red-900"
              checked={productForm.isPopular}
              onChange={(e) =>
                onFormChange({ ...productForm, isPopular: e.target.checked })
              }
            />
            <label htmlFor="popular" className="font-bold text-red-900 text-sm">
              Menu Favorit (Best Seller)?
            </label>
          </div>
          <button
            onClick={onSave}
            className="w-full bg-red-900 text-amber-400 py-3 rounded-xl font-black hover:bg-red-800 mt-4 flex justify-center items-center gap-2"
          >
            <Save size={18} /> SIMPAN MENU
          </button>
        </div>
      </div>
    </div>
  );
}


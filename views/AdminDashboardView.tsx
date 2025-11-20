"use client";

import { LogOut, PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Product, ProductForm } from "@/types";
import { formatRupiah } from "@/lib/utils";
import ProductFormModal from "@/components/ProductFormModal";

interface AdminDashboardViewProps {
  products: Product[];
  onLogout: () => void;
  onAddProduct: () => void;
  isProductFormOpen: boolean;
  onCloseProductForm: () => void;
  productForm: ProductForm;
  onProductFormChange: (form: ProductForm) => void;
  editingProduct: Product | null;
  onSaveProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function AdminDashboardView({
  products,
  onLogout,
  onAddProduct,
  isProductFormOpen,
  onCloseProductForm,
  productForm,
  onProductFormChange,
  editingProduct,
  onSaveProduct,
  onEditProduct,
  onDeleteProduct,
}: AdminDashboardViewProps) {
  return (
    <>
      <div className="min-h-screen bg-amber-50 font-sans pb-20">
        <div className="bg-red-900 text-amber-400 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
          <h1 className="font-black text-xl tracking-tight">DASHBOARD</h1>
          <button
            onClick={onLogout}
            className="bg-red-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-700"
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
              <p className="text-2xl font-black text-red-900">{products.length}</p>
            </div>
            <button
              onClick={onAddProduct}
              className="bg-amber-400 text-red-900 px-4 py-2 rounded-xl font-black border-2 border-red-900 shadow-[3px_3px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none flex items-center gap-2"
            >
              <PlusCircle size={18} /> TAMBAH MENU
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-amber-100 text-red-900 border-b-2 border-amber-200">
                <tr>
                  <th className="p-4 font-black text-xs uppercase">Produk</th>
                  <th className="p-4 font-black text-xs uppercase hidden md:table-cell">
                    Harga
                  </th>
                  <th className="p-4 font-black text-xs uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-200 bg-gray-100"
                      />
                      <div>
                        <span className="font-bold text-red-900 text-sm block">
                          {p.name}
                        </span>
                        <span className="text-[10px] bg-amber-200 px-1.5 rounded text-red-900 font-bold">
                          {p.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-red-900 text-sm hidden md:table-cell">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onEditProduct(p)}
                        className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg mr-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-red-600 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-bold">
                Belum ada menu. Tambahkan sekarang!
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={onCloseProductForm}
        productForm={productForm}
        onFormChange={onProductFormChange}
        editingProduct={editingProduct}
        onSave={onSaveProduct}
      />
    </>
  );
}


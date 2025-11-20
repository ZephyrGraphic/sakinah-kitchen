"use client";

import { Plus, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white p-3 rounded-2xl border-2 border-amber-200 hover:border-red-900 transition-all group shadow-sm hover:shadow-md flex flex-col h-full">
      <div className="relative mb-3 rounded-xl overflow-hidden aspect-square bg-amber-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isPopular && (
          <span className="absolute top-2 left-2 bg-amber-400 text-red-900 text-[10px] font-black px-2 py-1 rounded border border-red-900 shadow-sm flex items-center gap-1">
            <Star size={10} fill="#7f1d1d" /> HIT
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-red-950 text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">
          {product.category}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 border-t-2 border-dashed border-amber-100">
          <span className="font-black text-red-700 text-sm">
            {formatRupiah(product.price)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-red-900 text-amber-400 p-1.5 rounded-lg hover:bg-red-800 active:scale-90 transition shadow-sm border-2 border-transparent hover:border-amber-400"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}


"use client";

import { ChefHat, ShoppingBag } from "lucide-react";

interface NavbarProps {
  onHomeClick: () => void;
  onCartClick: () => void;
  totalItems: number;
}

export default function Navbar({ onHomeClick, onCartClick, totalItems }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-amber-400 px-4 py-3 flex justify-between items-center shadow-md border-b-4 border-red-900">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={onHomeClick}
      >
        <div className="bg-white p-1.5 rounded-xl border-2 border-red-900 -rotate-3 hover:rotate-0 transition-transform">
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
        className="relative cursor-pointer"
        onClick={onCartClick}
      >
        <div className="bg-white p-2 rounded-xl border-2 border-red-900 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] active:translate-y-1 active:shadow-none transition hover:bg-amber-50">
          <ShoppingBag className="text-red-900" size={22} />
        </div>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            {totalItems}
          </span>
        )}
      </div>
    </nav>
  );
}


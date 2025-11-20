export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isPopular?: boolean;
};

export type CartItem = Product & { quantity: number };

export type OrderForm = {
  name: string;
  address: string;
  phone: string;
  note: string;
  paymentMethod: "transfer" | "cod";
};

export type ViewType = "home" | "cart" | "checkout" | "admin-login" | "admin-dashboard";

export type ProductForm = {
  name: string;
  category: string;
  price: string;
  image: string;
  isPopular: boolean;
};


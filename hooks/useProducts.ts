import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import type { Product, ProductForm } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveProduct = async (productForm: ProductForm, editingProduct: Product | null) => {
    if (!db) throw new Error("Firebase belum diinisialisasi");

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      image: productForm.image || "https://via.placeholder.com/150?text=No+Image",
      isPopular: productForm.isPopular,
    };

    if (editingProduct) {
      await updateDoc(doc(db, "products", editingProduct.id), payload);
    } else {
      await addDoc(collection(db, "products"), payload);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, "products", id));
  };

  return { products, isLoading, saveProduct, deleteProduct };
}


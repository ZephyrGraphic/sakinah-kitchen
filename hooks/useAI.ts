import { useState } from "react";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export function useAI(products: any[]) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const handleAskAI = async () => {
    if (!aiMoodInput.trim()) return;

    setIsAILoading(true);
    setAiResponse(null);

    try {
      const menuList = products
        .map(
          (p) =>
            `${p.name} (Kategori: ${p.category}, Harga: ${formatRupiah(p.price)})`
        )
        .join(", ");

      const systemPrompt = `
        Kamu adalah 'Sakinah Bot', asisten kuliner yang sangat gaul, lucu, dan akrab untuk brand 'Sakinah Kitchen'.
        
        Tugasmu:
        1. Analisa mood user: "${aiMoodInput}".
        2. Pilih SATU menu dari daftar berikut yang paling cocok untuk mood tersebut: [${menuList}].
        3. Berikan alasan yang lucu, pakai bahasa gaul Indonesia (pakai istilah kayak 'bestie', 'mengcapek', 'gaskeun', 'mantul'), dan emotikon yang banyak.
        4. Jangan sebutkan menu yang tidak ada di daftar.
        5. Jawaban harus singkat (maksimal 3 kalimat).
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Waduh, AI-nya lagi makan Cireng, coba tanya lagi ya!";
      setAiResponse(text);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setAiResponse("Yah, koneksi putus nih bestie. Coba cek internet kamu ya!");
    } finally {
      setIsAILoading(false);
    }
  };

  return {
    isAIModalOpen,
    setIsAIModalOpen,
    aiMoodInput,
    setAiMoodInput,
    aiResponse,
    isAILoading,
    handleAskAI,
  };
}


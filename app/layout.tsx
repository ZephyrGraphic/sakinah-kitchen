import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sakinah Kitchen - Aneka Jajanan Kekinian",
  description:
    "Cireng, Cimol, Mochi, Rice Bowl. Semuanya enak, semuanya murah! Pesan jajanan favoritmu sekarang.",
  keywords: [
    "jajanan",
    "cireng",
    "cimol",
    "mochi",
    "rice bowl",
    "kuliner",
    "makanan",
    "sakinah kitchen",
  ],
  authors: [{ name: "Sakinah Kitchen" }],
  openGraph: {
    title: "Sakinah Kitchen - Aneka Jajanan Kekinian",
    description:
      "Cireng, Cimol, Mochi, Rice Bowl. Semuanya enak, semuanya murah! Pesan jajanan favoritmu sekarang.",
    url: "https://sakinah-kitchen.vercel.app",
    siteName: "Sakinah Kitchen",
    images: [
      {
        url: "https://sakinah-kitchen.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sakinah Kitchen - Aneka Jajanan Kekinian",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakinah Kitchen - Aneka Jajanan Kekinian",
    description:
      "Cireng, Cimol, Mochi, Rice Bowl. Semuanya enak, semuanya murah!",
    images: ["https://sakinah-kitchen.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://sakinah-kitchen.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

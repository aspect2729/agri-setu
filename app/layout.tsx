import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const notoKannada = Noto_Sans_Kannada({
  weight: ["400", "500", "600", "700"],
  subsets: ["kannada"],
  variable: "--font-kannada",
});

export const metadata: Metadata = {
  title: "Agri Setu — Organizing the market around the farmer",
  description:
    "Agri Setu connects farmers, White Store collection centers and bulk buyers in one system — with quality grading, instant farmer payment and QR-verified batches.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${notoKannada.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

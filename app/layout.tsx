import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepEdge - MBA Interview Prep",
  description: "Your AI-powered mock interview partner for MBA placements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased gradient-bg min-h-screen`}
      >
        {children}
        <Toaster 
          theme="dark" 
          position="top-center"
          toastOptions={{
            style: {
              background: 'oklch(0.18 0.025 270)',
              border: '1px solid oklch(0.28 0.03 270)',
              color: 'oklch(0.95 0.01 270)',
            },
          }}
        />
      </body>
    </html>
  );
}

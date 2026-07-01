import type { Metadata } from "next";
import { Manjari } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { MainLayout } from "@/components/MainLayout";
import { Toaster } from "sonner";

const manjari = Manjari({
  weight: ["100", "400", "700"],
  subsets: ["latin"],
  variable: "--font-manjari",
});

export const metadata: Metadata = {
  title: "jevxo HRM",
  description: "HRM system by jevxo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manjari.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}

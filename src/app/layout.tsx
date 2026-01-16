import type { Metadata } from "next";
import "./globals.css";
import Header from './components/header';

export const metadata: Metadata = {
  title: "Macarena Pozzuto",
  description: "Independent graphic designer from Argentina based in Barcelona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Header />
        {children}
      </body>
    </html>
  );
}

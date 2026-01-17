import type { Metadata } from "next";
import "./globals.css";
import Header from './components/header';
import Blur from './components/blur';
import { BlurProvider } from './context/blur-context';


export const metadata: Metadata = {
  title: "Macarena Pozzuto",
  description: "Independent graphic designer from Argentina based in Barcelona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const isAbout = false;

  return (
    <html lang="en">
      <body className="bg-black">
        <BlurProvider>
          <Blur />
          <Header />
          {children}
        </BlurProvider>
      </body>
    </html>
  );
}

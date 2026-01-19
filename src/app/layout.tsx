import type { Metadata } from "next";
import "./globals.css";
import Header from './components/header';
import Blur from './components/blur';
import { BlurProvider } from './context/blur-context';
import { AboutProvider } from './context/about-context';
import About from './components/about';
import { ABOUT_QUERY } from "././queries/about-query";

export const metadata: Metadata = {
  title: "Macarena Pozzuto",
  description: "Independent graphic designer from Argentina based in Barcelona",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

const options = { next: { revalidate: 30 } };

  return (
    <html lang="en">
      <body className="bg-black">
        <BlurProvider>
          <AboutProvider>
          <Blur />
          <Header />
          {children}
          <About />
          </AboutProvider>
        </BlurProvider>
      </body>
    </html>
  );
}


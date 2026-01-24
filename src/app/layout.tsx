import type { Metadata } from "next";
import "./globals.css";
import { client } from "../sanity/client";

import Header from './components/header';
import Blur from './components/blur';
import { BlurProvider } from './context/blur-context';

import { AboutProvider } from './context/about-context';
import About from './components/about';
import { ABOUT_QUERY } from "././queries/about-query";

import Transition from './transition';

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
  const aboutData = await client.fetch(ABOUT_QUERY, {}, options);

  return (
    <html lang="en">
      <body className="bg-black">
        <BlurProvider>
          <AboutProvider>
            <Blur />
            <Header />
            {/* <Transition> */}
              {children}
            {/* </Transition> */}
            <About data={aboutData} />
          </AboutProvider>
        </BlurProvider>
      </body>
    </html>
  );
}


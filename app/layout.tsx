import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">

      <body className="m-0">

        <header className="fixed z-50 top-0 left-0 p-[10px] flex w-full">

          <div className="flex-1">
            <p>MPZZ</p>
          </div>

          <div className="flex lg:flex-5 gap-[.2em]">
            <p>Projects,</p>
            <p className="opacity-30">About,</p>
            <p className="opacity-30">Archive</p>
          </div>

        </header>

        {children}

      </body>
      
    </html>
  );
}
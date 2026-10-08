import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolaTrades - Binary Trading Platform",
  description: "Trade binary options on synthetic indices",
};

export const viewport: Viewport = {
  themeColor: "#833ab4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        {/* Tawk.to live chat */}
        <Script
          id="tawk-to-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6ac52e34d4330d34c835cf9e/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
`,
          }}
        />
   </body>
    </html>
  );
}

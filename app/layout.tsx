import type { Metadata } from "next"
import { Bricolage_Grotesque, Inter } from "next/font/google"
import "@/app/globals.css"
import "@/app/globals.css"

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700"]
})

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
})

export const metadata: Metadata = {
  icons:{
    icon: ["/icon.png", "/icon32x32.png", "/icon192x192.png", "/icon512x512.png"],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  },
  title: "Savings Tracker",
  description: "",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.className} ${inter.className} h-full antialiased`}
    >
      <body className="min-h-dvh bg-neutral-900 text-neutral-0">
        {children}
      </body>
    </html>
  );
}

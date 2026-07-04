import type { Metadata } from "next"
import { Geist_Mono, DM_Sans, Roboto } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DigiShop — The Pocket-Powered Smart Shop",
  description:
    "Mobile-first shop management and customer storefront. Scan inventory, run checkout from your phone, and let customers order online for pickup.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full font-sans antialiased",
        dmSans.variable,
        roboto.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}

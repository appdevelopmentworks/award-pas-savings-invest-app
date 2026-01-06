import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "AwardPAS | Savings & Investment Studio",
  description:
    "A modern savings and investment MVP that turns goals into confident plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

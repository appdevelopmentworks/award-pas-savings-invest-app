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
  icons: {
    icon: "/appicon.png",
    apple: "/appicon.png",
  },
  openGraph: {
    title: "AwardPAS | Savings & Investment Studio",
    description:
      "A modern savings and investment MVP that turns goals into confident plans.",
    images: [
      {
        url: "/appicon.png",
        width: 512,
        height: 512,
        alt: "AwardPAS app icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AwardPAS | Savings & Investment Studio",
    description:
      "A modern savings and investment MVP that turns goals into confident plans.",
    images: ["/appicon.png"],
  },
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

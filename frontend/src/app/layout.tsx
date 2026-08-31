import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Seoul Companion",
  description: "Your personalized Seoul study-abroad companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
    >
    <body className={`${newsreader.variable} ${manrope.variable} font-sans`}>
      {children}
    </body>
    </html>
  );
}
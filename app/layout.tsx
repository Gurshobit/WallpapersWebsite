import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HDWallpapers.site — Free HD Wallpapers",
    template: "%s | HDWallpapers.site",
  },
  description:
    "Download free HD wallpapers for desktop, mobile and tablet in multiple resolutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${manrope.variable} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

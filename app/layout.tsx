import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Big Shack Laundry Scheduling | Built by Shon Hoang",
  description: "Real-time roommate laundry calendar application. Pick an available time slot and coordinate laundry days smoothly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-[#F5F6FA] text-slate-900 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

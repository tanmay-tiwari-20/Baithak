import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import PwaRegister from "@/components/PwaRegister";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Baithak — Premium Video Meetings & Collaboration",
  description:
    "Enterprise-grade, crystal-clear video calling and collaborative meetings inspired by Google Meet with real-time screen sharing, recording, and scheduling.",
  icons: {
    icon: "/icons/logo.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1B1E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <ClerkProvider
        appearance={{
          layout: {
            logoImageUrl: "/icons/logo.svg",
            socialButtonsVariant: "blockButton",
          },
          variables: {
            colorText: "#F8FAFC",
            colorPrimary: "#8AB4F8",
            colorBackground: "#1A1B1E",
            colorInputBackground: "#202124",
            colorInputText: "#F8FAFC",
            colorTextSecondary: "#94A3B8",
            borderRadius: "0.75rem",
          },
        }}
      >
        <body
          className={`${plusJakartaSans.variable} antialiased bg-dark-1 text-slate-100 min-h-screen selection:bg-[#8AB4F8]/20 selection:text-[#AECBFA]`}
        >
          {children}
          <Toaster />
          <PwaRegister />
        </body>
      </ClerkProvider>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";

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
    apple: "/icons/logo.svg",
  },
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
            colorPrimary: "#00D2D3",
            colorBackground: "#111622",
            colorInputBackground: "#171E2D",
            colorInputText: "#F8FAFC",
            colorTextSecondary: "#94A3B8",
            borderRadius: "0.75rem",
          },
        }}
      >
        <body
          className={`${plusJakartaSans.variable} font-sans antialiased bg-dark-1 text-slate-100 min-h-screen selection:bg-brand-cyan/20 selection:text-brand-cyan`}
        >
          {children}
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
}

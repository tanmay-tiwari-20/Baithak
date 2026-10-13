import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Baithak — Video calls and meetings for everyone",
  description: "Secure, reliable, enterprise-grade video meetings inspired by Google Meet.",
  icons: {
    icon: "/icons/logo.svg",
  },
};

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative min-h-screen bg-[#1A1B1E] text-[#E8EAED]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <section className="flex min-h-screen min-w-0 flex-1 flex-col px-4 pb-12 pt-24 max-md:pb-14 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;

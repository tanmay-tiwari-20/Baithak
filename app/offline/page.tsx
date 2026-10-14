import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1A1B1E] px-5 py-12 text-[#E8EAED]">
      <section className="w-full max-w-md rounded-3xl border border-[#3C4043] bg-[#202124] p-7 text-center sm:p-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#28292C] text-[#AECBFA]">
          <WifiOff className="size-6" aria-hidden="true" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#AECBFA]">Baithak</p>
        <h1 className="text-2xl font-semibold tracking-tight">You’re offline</h1>
        <p className="mt-3 text-sm leading-6 text-[#9AA0A6]">
          Connect to the internet to start or join a meeting. Your workspace will be ready when you’re back online.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1A73E8] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1557B0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#202124]"
        >
          Try again
        </Link>
      </section>
    </main>
  );
}

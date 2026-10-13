"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useGetCallById } from "@/hooks/useGetCallById";
import Alert from "@/components/Alert";
import BaithakLogo from "@/components/BaithakLogo";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";

const MeetingPage = () => {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { isLoaded, user } = useUser();
  const { call, isCallLoading, loadError } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading)
    return (
      <main className="flex min-h-dvh w-full items-center justify-center bg-[#101216] px-6 text-[#E8EAED]">
        <div className="flex w-full max-w-sm flex-col items-center rounded-[1.75rem] border border-white/[0.09] bg-[#181b22] px-8 py-10 text-center shadow-2xl shadow-black/30" role="status" aria-live="polite">
          <BaithakLogo size={34} />
          <Loader2 className="mt-10 size-8 animate-spin text-[#AECBFA]" />
          <p className="mt-5 text-sm font-medium text-[#E8EAED]">Preparing your meeting</p>
          <p className="mt-2 text-xs leading-5 text-[#8B909A]">Checking the room and your access before opening the preview.</p>
        </div>
      </main>
    );

  if (loadError) return <Alert title="Unable to load this meeting" />;
  if (!call) return <Alert title="Meeting not found" />;

  const isUserAllowed =
    call.type !== "invited" ||
    (user && call.state?.members?.some((m) => m.user?.id === user.id));

  if (!isUserAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="min-h-dvh w-full bg-[#101216]">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;

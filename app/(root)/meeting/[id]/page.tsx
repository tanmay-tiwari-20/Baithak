"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useGetCallById } from "@/hooks/useGetCallById";
import Alert from "@/components/Alert";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";

const MeetingPage = () => {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading)
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#202124] text-[#E8EAED] gap-4">
        <Loader2 className="w-10 h-10 text-[#8AB4F8] animate-spin" />
        <p className="text-sm text-[#9AA0A6]">Joining Baithak...</p>
      </div>
    );

  if (!call)
    return <Alert title="Call Not Found or Expired" />;

  const isUserAllowed =
    call.type !== "invited" ||
    (user && call.state?.members?.some((m) => m.user?.id === user.id));

  if (!isUserAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full bg-[#202124]">
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

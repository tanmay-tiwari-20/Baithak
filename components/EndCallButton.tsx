"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React from "react";
import { useRouter } from "next/navigation";
import { PhoneOff } from "lucide-react";

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  return (
    <button
      onClick={async () => {
        await call.endCall();
        router.push("/");
      }}
      title="End call for everyone"
      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EA4335] hover:bg-[#D93025] text-white text-xs font-medium transition-colors"
    >
      <PhoneOff className="w-4 h-4" />
      <span className="hidden sm:inline">End for all</span>
    </button>
  );
};

export default EndCallButton;

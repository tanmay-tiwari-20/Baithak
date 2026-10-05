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
      aria-label="End call for everyone"
      className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#EA4335] px-3 text-xs font-medium text-white transition-colors hover:bg-[#D93025] sm:px-4"
    >
      <PhoneOff className="size-[18px] shrink-0" />
      <span className="hidden lg:inline">End for all</span>
    </button>
  );
};

export default EndCallButton;

"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PhoneOff } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endMeeting = async () => {
    if (!call || isEnding) return;
    setIsEnding(true);
    try {
      await call.endCall();
      router.push("/");
    } catch (error) {
      console.error("Unable to end meeting", error);
      toast({
        title: "Could not end meeting",
        description: "The meeting is still active. Check your connection and try again.",
      });
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Dialog open={isConfirmOpen} onOpenChange={(open) => !isEnding && setIsConfirmOpen(open)}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="End call for everyone"
          aria-label="End call for everyone"
          className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#B3261E] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#D33B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6AEA8] sm:px-4"
        >
          <PhoneOff className="size-[18px] shrink-0" />
          <span className="hidden lg:inline">End for all</span>
        </button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#1c1f27] text-[#E8EAED] shadow-2xl shadow-black/50 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#F1F3F4]">End this meeting for everyone?</DialogTitle>
          <DialogDescription className="pt-2 leading-6 text-[#A5AAB3]">
            Everyone will be removed from the meeting, and this room will end for all participants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <button
              type="button"
              disabled={isEnding}
              className="h-10 rounded-xl border border-white/10 px-4 text-sm font-medium text-[#D8DCE3] transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:opacity-50"
            >
              Keep meeting
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={endMeeting}
            disabled={isEnding}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#B3261E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#D33B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6AEA8] disabled:cursor-wait disabled:opacity-60"
          >
            {isEnding && <LoaderCircle className="size-4 animate-spin" />}
            {isEnding ? "Ending…" : "End for everyone"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndCallButton;

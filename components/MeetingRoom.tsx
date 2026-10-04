/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React, { useState, useEffect } from "react";
import {
  LayoutList,
  Users,
  Info,
  PhoneOff,
  Copy,
  Check,
  Smile,
  Hand,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { useToast } from "@/hooks/use-toast";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const reactions = ["👍", "👏", "❤️", "🎉", "😂", "😮"];

const MeetingRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = (params?.id as string) || "";
  const isPersonalRoom = !!searchParams.get("personal");

  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const call = useCall();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendReaction = async (emoji: string) => {
    if (!call) return;
    try {
      await call.sendCustomEvent({
        type: "reaction",
        emoji,
      });
      toast({ title: `Sent ${emoji}` });
      setShowReactions(false);
    } catch (e) {
      console.log(e);
    }
  };

  const copyMeetingInfo = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Meeting Link Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#202124] text-[#E8EAED] flex flex-col justify-between select-none">
      {/* Top Subtle Bar */}
      <header className="h-12 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs text-[#9AA0A6]">
          <ShieldCheck className="w-4 h-4 text-[#8AB4F8]" />
          <span>Baithak Secure Room</span>
        </div>
        <div className="text-xs text-[#9AA0A6]">{currentTime}</div>
      </header>

      {/* Main Video Presentation Grid */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="flex size-full max-w-[1200px] items-center justify-center">
          <CallLayout />
        </div>

        {/* Right Drawer: Participants Panel */}
        {showParticipants && (
          <div className="absolute right-4 top-4 bottom-24 w-80 rounded-2xl bg-[#28292C] border border-[#3C4043] p-4 shadow-2xl z-30 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#3C4043]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8AB4F8]" />
                <span className="font-medium text-sm text-[#E8EAED]">People</span>
                <span className="text-xs text-[#9AA0A6]">({participantCount})</span>
              </div>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-xs text-[#9AA0A6] hover:text-[#E8EAED]"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
              <CallParticipantsList onClose={() => setShowParticipants(false)} />
            </div>
          </div>
        )}

        {/* Right Drawer: Meeting Info Panel */}
        {showInfo && (
          <div className="absolute right-4 top-4 w-80 rounded-2xl bg-[#28292C] border border-[#3C4043] p-5 shadow-2xl z-30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-[#E8EAED]">Joining info</span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xs text-[#9AA0A6] hover:text-[#E8EAED]"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#9AA0A6]">Meeting Code</p>
              <p className="text-sm font-mono text-[#8AB4F8]">{meetingId}</p>
            </div>
            <button
              onClick={copyMeetingInfo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#303134] hover:bg-[#3C4043] text-sm text-[#8AB4F8] font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy joining info"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Reaction Bubble Bar if active */}
      {showReactions && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#28292C] border border-[#3C4043] px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 z-40">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Iconic Google Meet Bottom Docking Bar */}
      <footer className="h-20 bg-[#202124] border-t border-[#3C4043] px-4 md:px-8 flex items-center justify-between z-20">
        {/* Left: Time & Meeting Code */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <span className="font-normal text-[#E8EAED]">{currentTime}</span>
          <span className="text-[#5F6368]">|</span>
          <button
            onClick={copyMeetingInfo}
            title="Click to copy meeting code"
            className="flex items-center gap-1.5 font-mono text-xs text-[#9AA0A6] hover:text-[#E8EAED] px-2.5 py-1 rounded-md hover:bg-[#303134] transition-colors"
          >
            <span>{meetingId.substring(0, 12)}...</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto md:mx-0">
          {/* Stream Standard Video/Audio Controls */}
          <CallControls onLeave={() => router.push("/")} />

          {/* Reactions Button */}
          <button
            onClick={() => setShowReactions((prev) => !prev)}
            title="Send a reaction"
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
              showReactions
                ? "bg-[#8AB4F8] text-[#202124]"
                : "bg-[#3C4043] text-white hover:bg-[#5F6368]"
            )}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Layout Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Change layout"
                className="w-11 h-11 rounded-full bg-[#3C4043] hover:bg-[#5F6368] text-white flex items-center justify-center transition-colors"
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="bg-[#28292C] border border-[#3C4043] text-[#E8EAED] rounded-xl p-1.5 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setLayout("speaker-left")}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg hover:bg-[#303134] focus:bg-[#303134]"
              >
                Speaker (Side by side)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLayout("grid")}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg hover:bg-[#303134] focus:bg-[#303134]"
              >
                Tiled Grid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLayout("speaker-right")}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg hover:bg-[#303134] focus:bg-[#303134]"
              >
                Speaker (Right bar)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Call Stats */}
          <CallStatsButton />

          {/* Owner End Call Option */}
          {!isPersonalRoom && <EndCallButton />}
        </div>

        {/* Right: Info + Participants Toggle */}
        <div className="flex items-center gap-2">
          {/* Info Details Trigger */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            title="Meeting details"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              showInfo
                ? "bg-[#303134] text-[#8AB4F8]"
                : "text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]"
            )}
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Participants Toggle */}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            title="People in call"
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              showParticipants
                ? "bg-[#303134] text-[#8AB4F8]"
                : "text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]"
            )}
          >
            <Users className="w-5 h-5" />
            {participantCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#8AB4F8] text-[#202124] rounded-full text-[10px] font-bold">
                {participantCount}
              </span>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
};

export default MeetingRoom;

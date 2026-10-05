"use client";

import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import {
  LayoutList,
  Users,
  Info,
  Copy,
  Check,
  ShieldCheck,
  DoorOpen,
  DoorClosed,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { useToast } from "@/hooks/use-toast";
import MeetingAdmissionControls from "./MeetingAdmissionControls";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";

type CallLayoutType = "grid" | "speaker-left";

const MeetingCallLayout = ({ layout }: { layout: CallLayoutType }) => {
  switch (layout) {
    case "grid":
      return <PaginatedGridLayout groupSize={16} />;
    default:
      return <SpeakerLayout participantsBarPosition="bottom" participantsBarLimit="dynamic" />;
  }
};

const MeetingRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = (params?.id as string) || "";
  const isPersonalRoom = !!searchParams.get("personal");

  const [layout, setLayout] = useState<CallLayoutType>("grid");
  const [activePanel, setActivePanel] = useState<"people" | "info" | "access" | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const router = useRouter();
  const { toast } = useToast();
  const { call: currentCall, isHost, quickAccess, pendingRequests, custom } = useMeetingAccess();

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

  const copyMeetingInfo = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Meeting link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy meeting link" });
    }
  };

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      toast({ title: "Meeting code copied" });
    } catch {
      toast({ title: "Could not copy meeting code" });
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative flex h-dvh w-full select-none flex-col justify-between overflow-hidden bg-[#111318] text-[#E8EAED]">
      {/* Top Subtle Bar */}
      <header className="z-10 flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#8AB4F8]/10 text-[#AECBFA]">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#E8EAED]">{custom.description || "Baithak meeting"}</p>
            <p className="text-xs text-[#8B909A]">{participantCount} {participantCount === 1 ? "person" : "people"} in this meeting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#BEC2CB] sm:inline-flex">{currentTime}</span>
          {isHost && (currentCall?.type === "baithak" || currentCall?.type === "default") && (
            <button
              onClick={() => setActivePanel((panel) => panel === "access" ? null : "access")}
              title="Meeting access controls"
              className={`relative flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${activePanel === "access" ? "border-[#8AB4F8]/40 bg-[#8AB4F8]/10 text-[#AECBFA]" : "border-white/10 bg-white/[0.04] text-[#C6CAD2] hover:bg-white/[0.08]"}`}
            >
              {quickAccess ? <DoorOpen className="size-4" /> : <DoorClosed className="size-4" />}
              <span className="hidden sm:inline">{quickAccess ? "Open access" : "Host approval"}</span>
              {pendingRequests.length > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-[#8AB4F8] text-[10px] font-bold text-[#111318]">{pendingRequests.length}</span>}
            </button>
          )}
        </div>
      </header>

      {/* Responsive participant layout */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pb-2 sm:px-5 sm:pb-3">
        <div className="meeting-stage flex size-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#171a21] shadow-2xl shadow-black/20 sm:rounded-2xl">
          <MeetingCallLayout layout={layout} />
        </div>

        {activePanel === "access" && isHost && (
          <div className="absolute right-4 top-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#1c1f27] p-3 shadow-2xl shadow-black/40 sm:right-7 sm:top-5">
            <MeetingAdmissionControls compact />
          </div>
        )}

        {/* Right Drawer: Participants Panel */}
        {activePanel === "people" && (
          <div className="absolute right-4 top-4 bottom-4 z-30 flex w-[min(22rem,calc(100vw-2rem))] flex-col rounded-2xl border border-white/10 bg-[#1c1f27]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8AB4F8]" />
                <span className="font-medium text-sm text-[#E8EAED]">People</span>
                <span className="text-xs text-[#9AA0A6]">({participantCount})</span>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="text-xs text-[#9AA0A6] hover:text-[#E8EAED]"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
              <CallParticipantsList onClose={() => setActivePanel(null)} />
            </div>
          </div>
        )}

        {/* Right Drawer: Meeting Info Panel */}
        {activePanel === "info" && (
          <div className="absolute right-4 top-4 z-30 w-[min(22rem,calc(100vw-2rem))] space-y-4 rounded-2xl border border-white/10 bg-[#1c1f27]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-[#E8EAED]">Joining info</span>
              <button
                onClick={() => setActivePanel(null)}
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

      {/* Meeting controls */}
      <footer className="z-20 shrink-0 px-2 pb-2 sm:px-5 sm:pb-4">
        <div className="meeting-toolbar mx-auto grid min-h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#1c1f27]/95 px-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:min-h-[4.5rem] sm:px-5">
        {/* Left: Time & Meeting Code */}
        <div className="hidden min-w-0 items-center gap-3 text-sm lg:flex">
          <span className="font-normal text-[#E8EAED]">{currentTime}</span>
          <span className="text-[#5F6368]">|</span>
          <button
            onClick={copyMeetingCode}
            title="Copy meeting code"
            className="flex items-center gap-1.5 font-mono text-xs text-[#9AA0A6] hover:text-[#E8EAED] px-2.5 py-1 rounded-md hover:bg-[#303134] transition-colors"
          >
            <span>{meetingId.length > 12 ? `${meetingId.substring(0, 12)}…` : meetingId}</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Action Controls */}
        <div className="meeting-toolbar__center flex min-w-0 items-center justify-center gap-1.5 sm:gap-2">
          {/* Stream Standard Video/Audio Controls */}
          <CallControls onLeave={() => router.push("/")} />

          {/* Layout Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Change layout"
                className="meeting-toolbar__icon-button"
              >
                <LayoutList className="size-5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="bg-[#28292C] border border-[#3C4043] text-[#E8EAED] rounded-xl p-1.5 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setLayout("grid")}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg hover:bg-[#303134] focus:bg-[#303134]"
              >
                Auto · Adaptive grid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLayout("speaker-left")}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg hover:bg-[#303134] focus:bg-[#303134]"
              >
                Spotlight with filmstrip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Call Stats */}
          <CallStatsButton />

          {/* Owner End Call Option */}
          {!isPersonalRoom && <EndCallButton />}
        </div>

        {/* Right: Info + Participants Toggle */}
        <div className="meeting-toolbar__side flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          {/* Info Details Trigger */}
          <button
            onClick={() => setActivePanel((panel) => panel === "info" ? null : "info")}
            title="Meeting details"
            className={cn(
              "meeting-toolbar__side-button rounded-full flex items-center justify-center transition-colors",
              activePanel === "info"
                ? "bg-[#303134] text-[#8AB4F8]"
                : "text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]"
            )}
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Participants Toggle */}
          <button
            onClick={() => setActivePanel((panel) => panel === "people" ? null : "people")}
            title="People in call"
            className={cn(
              "meeting-toolbar__side-button relative rounded-full flex items-center justify-center transition-colors",
              activePanel === "people"
                ? "bg-[#303134] text-[#8AB4F8]"
                : "text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]"
            )}
          >
            <Users className="w-5 h-5" />
            {participantCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#8AB4F8] px-1 text-center text-[10px] leading-4 font-bold text-[#202124]">
                {participantCount}
              </span>
            )}
          </button>
        </div>
        </div>
      </footer>
    </section>
  );
};

export default MeetingRoom;

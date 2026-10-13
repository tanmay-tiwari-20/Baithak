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
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  DoorClosed,
  DoorOpen,
  Info,
  LayoutGrid,
  MessageCircle,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { useToast } from "@/hooks/use-toast";
import MeetingAdmissionControls from "./MeetingAdmissionControls";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";
import MeetingChat from "./MeetingChat";

type CallLayoutType = "grid" | "speaker-left";
type ActivePanel = "people" | "info" | "access" | "chat" | null;

const MeetingCallLayout = ({ layout }: { layout: CallLayoutType }) => {
  if (layout === "grid") {
    return <PaginatedGridLayout groupSize={16} />;
  }

  return (
    <SpeakerLayout
      participantsBarPosition="bottom"
      participantsBarLimit="dynamic"
      pageArrowsVisible
    />
  );
};

const PanelHeader = ({
  icon,
  title,
  description,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#8AB4F8]/10 text-[#AECBFA]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[#F1F3F4]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-[#8B909A]">{description}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label={`Close ${title.toLowerCase()} panel`}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9AA0A6] transition-colors hover:bg-white/[0.06] hover:text-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]"
    >
      <X className="size-4" />
    </button>
  </div>
);

const MeetingRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = (params?.id as string) || "";
  const isPersonalRoom = !!searchParams.get("personal");

  const [layout, setLayout] = useState<CallLayoutType>("grid");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const router = useRouter();
  const { toast } = useToast();
  const { call: currentCall, isHost, quickAccess, pendingRequests, custom } = useMeetingAccess();

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const copyMeetingInfo = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Meeting link copied" });
      window.setTimeout(() => setCopied(false), 2000);
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

  const togglePanel = (panel: Exclude<ActivePanel, null>) => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isAdmissionMeeting = currentCall?.type === "baithak" || currentCall?.type === "default";
  const visibleParticipantCount = Math.max(1, Math.min(participantCount, 16));

  return (
    <section className="meeting-room relative flex h-dvh w-full select-none flex-col overflow-hidden bg-[#0F1115] text-[#E8EAED]">
      <header className="meeting-room__header z-20 flex shrink-0 items-center justify-between gap-4 px-3 py-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl border border-[#8AB4F8]/20 bg-[#8AB4F8]/10 text-[#AECBFA] sm:flex">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-[#F1F3F4] sm:text-[15px]">
                {custom.description || "Baithak meeting"}
              </p>
              <span className="hidden items-center gap-1.5 rounded-full border border-[#34A853]/25 bg-[#34A853]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FD7A5] sm:inline-flex">
                <span className="size-1.5 rounded-full bg-[#34A853]" /> Live
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-[#8B909A]">
              {participantCount} {participantCount === 1 ? "person" : "people"} in this meeting
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-xs tabular-nums text-[#BEC2CB] md:inline-flex">
            {currentTime}
          </span>
          {isHost && isAdmissionMeeting && (
            <button
              type="button"
              onClick={() => togglePanel("access")}
              aria-expanded={activePanel === "access"}
              title="Meeting access controls"
              className={cn(
                "relative flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]",
                activePanel === "access"
                  ? "border-[#8AB4F8]/40 bg-[#8AB4F8]/10 text-[#AECBFA]"
                  : "border-white/[0.09] bg-white/[0.04] text-[#C6CAD2] hover:bg-white/[0.08]",
              )}
            >
              {quickAccess ? <DoorOpen className="size-4" /> : <DoorClosed className="size-4" />}
              <span className="hidden sm:inline">{quickAccess ? "Open access" : "Host approval"}</span>
              {pendingRequests.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-[#AECBFA] text-[10px] font-bold text-[#101216]">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-3 lg:px-6">
        <div
          className="meeting-stage relative flex size-full min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171A20] shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
          data-layout={layout}
          data-participants={visibleParticipantCount}
        >
          <MeetingCallLayout layout={layout} />

          <MeetingChat
            isOpen={activePanel === "chat"}
            onClose={() => setActivePanel(null)}
            onUnreadChange={setChatUnreadCount}
          />

          {activePanel === "access" && isHost && (
            <aside className="meeting-panel absolute right-3 top-3 z-40 w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border border-white/[0.1] bg-[#1B1F27] p-4 shadow-2xl shadow-black/50 sm:right-5 sm:top-5">
              <PanelHeader
                icon={<ShieldCheck className="size-4" />}
                title="Meeting access"
                description="Control how new guests enter this room."
                onClose={() => setActivePanel(null)}
              />
              <div className="pt-4">
                <MeetingAdmissionControls compact />
              </div>
            </aside>
          )}

          {activePanel === "people" && (
            <aside className="meeting-panel absolute bottom-3 right-3 top-3 z-30 flex w-[min(23rem,calc(100vw-1.5rem))] flex-col rounded-2xl border border-white/[0.1] bg-[#1B1F27] p-4 shadow-2xl shadow-black/50 sm:bottom-5 sm:right-5 sm:top-5">
              <PanelHeader
                icon={<Users className="size-4" />}
                title="People"
                description={`${participantCount} ${participantCount === 1 ? "person" : "people"} in this meeting`}
                onClose={() => setActivePanel(null)}
              />
              <div className="min-h-0 flex-1 overflow-y-auto pt-3">
                <CallParticipantsList onClose={() => setActivePanel(null)} />
              </div>
            </aside>
          )}

          {activePanel === "info" && (
            <aside className="meeting-panel absolute right-3 top-3 z-30 w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border border-white/[0.1] bg-[#1B1F27] p-4 shadow-2xl shadow-black/50 sm:right-5 sm:top-5">
              <PanelHeader
                icon={<Info className="size-4" />}
                title="Joining info"
                description="Share this code with people you want to invite."
                onClose={() => setActivePanel(null)}
              />
              <div className="space-y-2 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B909A]">Meeting code</p>
                <button
                  type="button"
                  onClick={copyMeetingCode}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#232832] px-3.5 py-3 text-left transition-colors hover:border-[#8AB4F8]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]"
                >
                  <span className="font-mono text-sm text-[#D8E5FA]">{meetingId}</span>
                  <Copy className="size-4 text-[#8B909A] transition-colors group-hover:text-[#AECBFA]" />
                </button>
                <button
                  type="button"
                  onClick={copyMeetingInfo}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#AECBFA] text-sm font-semibold text-[#101216] transition-colors hover:bg-[#D2E3FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy joining info"}
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="meeting-room__footer z-20 shrink-0 px-2 pb-2 sm:px-4 sm:pb-4 lg:px-6">
        <div className="meeting-toolbar mx-auto grid min-h-16 max-w-[1700px] grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#1B1F27] px-3 shadow-2xl shadow-black/40 sm:min-h-[4.75rem] sm:px-5">
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <span className="text-sm tabular-nums text-[#D8DCE3]">{currentTime}</span>
            <span className="text-[#555B66]">•</span>
            <button
              type="button"
              onClick={copyMeetingCode}
              title="Copy meeting code"
              className="group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-xs text-[#9AA0A6] transition-colors hover:bg-white/[0.06] hover:text-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]"
            >
              <span className="truncate">{meetingId.length > 14 ? `${meetingId.substring(0, 14)}…` : meetingId}</span>
              <Copy className="size-3.5 shrink-0 transition-colors group-hover:text-[#AECBFA]" />
            </button>
          </div>

          <div className="meeting-toolbar__center flex min-w-0 items-center justify-center gap-1.5 sm:gap-2">
            <CallControls onLeave={() => router.push("/")} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" title="Change layout" className="meeting-toolbar__icon-button">
                  <LayoutGrid className="size-5 shrink-0" />
                  <span className="sr-only">Change layout</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" className="rounded-xl border border-white/10 bg-[#252A33] p-1.5 text-[#E8EAED] shadow-2xl">
                <DropdownMenuItem
                  onClick={() => setLayout("grid")}
                  className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm focus:bg-white/[0.08]", layout === "grid" && "bg-white/[0.08]")}
                >
                  Adaptive grid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("speaker-left")}
                  className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm focus:bg-white/[0.08]", layout === "speaker-left" && "bg-white/[0.08]")}
                >
                  Spotlight with filmstrip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CallStatsButton />
            {!isPersonalRoom && <EndCallButton />}
          </div>

          <div className="meeting-toolbar__side flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => togglePanel("chat")}
              aria-expanded={activePanel === "chat"}
              title="Open meeting chat"
              className={cn("meeting-toolbar__side-button relative", activePanel === "chat" && "meeting-toolbar__side-button--active")}
            >
              <MessageCircle className="size-5" />
              <span className="sr-only">Meeting chat</span>
              {chatUnreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#AECBFA] px-1 text-center text-[10px] font-bold leading-4 text-[#101216]">
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => togglePanel("info")}
              aria-expanded={activePanel === "info"}
              title="Meeting details"
              className={cn("meeting-toolbar__side-button", activePanel === "info" && "meeting-toolbar__side-button--active")}
            >
              <Info className="size-5" />
              <span className="sr-only">Meeting details</span>
            </button>
            <button
              type="button"
              onClick={() => togglePanel("people")}
              aria-expanded={activePanel === "people"}
              title="People in call"
              className={cn("meeting-toolbar__side-button relative", activePanel === "people" && "meeting-toolbar__side-button--active")}
            >
              <Users className="size-5" />
              <span className="sr-only">People in call</span>
              <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#AECBFA] px-1 text-center text-[10px] font-bold leading-4 text-[#101216]">
                {participantCount}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default MeetingRoom;

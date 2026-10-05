"use client";

import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Clapperboard, History, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetCalls } from "@/hooks/useGetCalls";
import Loader from "./Loader";
import MeetingCard from "./MeetingCard";

type CallListProps = {
  type: "ended" | "upcoming" | "recordings";
  refreshKey?: number;
};

type NamedRecording = CallRecording & {
  meetingName: string;
  callId: string;
  callType: string;
};

const getRecordingFileName = (recording: NamedRecording) => {
  const baseName = recording.meetingName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .slice(0, 100) || "Baithak meeting";
  const extension = recording.filename.match(/\.[a-z0-9]{2,5}$/i)?.[0] || ".mp4";
  return `${baseName}${extension}`;
};

const CallList = ({ type, refreshKey = 0 }: CallListProps) => {
  const router = useRouter();
  const [manualRefreshKey, setManualRefreshKey] = useState(0);
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls(refreshKey + manualRefreshKey);
  const [recordings, setRecordings] = useState<NamedRecording[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(type === "recordings");
  const { toast } = useToast();
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/+$/, "");
  const refreshButton = (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        onClick={() => setManualRefreshKey((key) => key + 1)}
        disabled={isLoading || isLoadingRecordings}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 text-xs font-medium text-[#BEC2CB] transition-colors hover:bg-white/[0.06] disabled:opacity-50"
      >
        <RefreshCw className={`size-3.5 ${isLoading || isLoadingRecordings ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );

  const downloadRecording = async (recording: NamedRecording) => {
    const fileName = getRecordingFileName(recording);
    try {
      const response = await fetch(recording.url);
      if (!response.ok) throw new Error(`Recording download failed (${response.status})`);
      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      toast({ title: "Recording downloaded", description: fileName });
    } catch (error) {
      console.error("Unable to download recording", error);
      toast({
        title: "Could not save this recording",
        description: "Copy the recording link and open it in a new tab to try again.",
      });
    }
  };

  useEffect(() => {
    if (type !== "recordings" || isLoading) return;

    let cancelled = false;
    setIsLoadingRecordings(true);
    const fetchRecordings = async () => {
      const results = await Promise.all(
        callRecordings.map(async (meeting) => {
          try {
            const response = await meeting.queryRecordings();
            const meetingName =
              (meeting.state.custom?.description as string | undefined)?.trim() ||
              "Baithak meeting";
            return response.recordings.map((recording) => ({
              ...recording,
              meetingName,
              callId: meeting.id,
              callType: meeting.type,
            }));
          } catch (error) {
            console.error(`Unable to load recordings for ${meeting.id}`, error);
            return [];
          }
        }),
      );

      if (!cancelled) {
        setRecordings(
          results
            .flat()
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
        );
        setIsLoadingRecordings(false);
      }
    };

    void fetchRecordings().catch((error) => {
      console.error("Unable to load recordings", error);
      if (!cancelled) {
        setRecordings([]);
        setIsLoadingRecordings(false);
        toast({ title: "Unable to load recordings" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [type, callRecordings, isLoading, refreshKey, toast]);

  if (isLoading || (type === "recordings" && isLoadingRecordings)) return <Loader />;

  if (type === "recordings") {
    if (recordings.length === 0) {
      return <>{refreshButton}<EmptyState type={type} /></>;
    }

    return (
      <>
        {refreshButton}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recordings.map((recording) => (
            <MeetingCard
              key={`${recording.callType}:${recording.callId}:${recording.filename}:${recording.start_time}`}
              title={recording.meetingName}
              date={new Date(recording.start_time).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              kind="recording"
              actionText="Download recording"
              link={recording.url}
              handleClick={() => void downloadRecording(recording)}
            />
          ))}
        </div>
      </>
    );
  }

  const calls: Call[] = type === "ended" ? endedCalls : upcomingCalls;
  if (calls.length === 0) return <>{refreshButton}<EmptyState type={type} /></>;

  return (
    <>
      {refreshButton}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {calls.map((meeting) => (
          <MeetingCard
            key={`${meeting.type}:${meeting.id}`}
            title={(meeting.state.custom?.description as string | undefined)?.trim() || "Baithak meeting"}
            date={new Date(
              type === "ended"
                ? meeting.state.endedAt || meeting.state.startsAt || meeting.state.createdAt
                : meeting.state.startsAt || meeting.state.createdAt,
            ).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            kind={type === "ended" ? "previous" : "upcoming"}
            actionText={type === "ended" ? "Open meeting" : "Join meeting"}
            link={`${baseUrl}/meeting/${encodeURIComponent(meeting.id)}`}
            handleClick={() => router.push(`/meeting/${encodeURIComponent(meeting.id)}`)}
          />
        ))}
      </div>
    </>
  );
};

const emptyStateContent = {
  ended: {
    eyebrow: "Your meeting history",
    title: "No previous meetings yet",
    text: "Finished meetings will appear here, so you can revisit their room details.",
    icon: History,
  },
  upcoming: {
    eyebrow: "Your calendar",
    title: "Your schedule is clear",
    text: "Scheduled meetings will appear here with their room links and start times.",
    icon: CalendarClock,
  },
  recordings: {
    eyebrow: "Your library",
    title: "No recordings yet",
    text: "When a meeting is recorded, it will appear here under its meeting name.",
    icon: Clapperboard,
  },
};

const EmptyState = ({ type }: { type: CallListProps["type"] }) => {
  const content = emptyStateContent[type];
  const Icon = content.icon;
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#1b1e25]/70 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
        <Icon className="size-6" />
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#8B909A]">{content.eyebrow}</p>
      <h2 className="mt-2 text-xl font-medium text-[#E8EAED]">{content.title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#9AA0A6]">{content.text}</p>
    </div>
  );
};

export default CallList;

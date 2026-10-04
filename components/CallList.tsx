"use client";

import { Call, CallRecording } from "@stream-io/video-react-sdk";
import Loader from "./Loader";
import { useGetCalls } from "@/hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Calendar, History, Video, Plus } from "lucide-react";
import { Button } from "./ui/button";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const { toast } = useToast();
  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getEmptyStateDetails = () => {
    switch (type) {
      case "ended":
        return {
          icon: <History className="w-8 h-8 text-[#9AA0A6]" />,
          title: "No previous meetings",
          description: "Calls that you joined or completed will appear here.",
        };
      case "upcoming":
        return {
          icon: <Calendar className="w-8 h-8 text-[#9AA0A6]" />,
          title: "No upcoming meetings",
          description: "When you schedule a meeting, it will appear here.",
        };
      case "recordings":
        return {
          icon: <Video className="w-8 h-8 text-[#9AA0A6]" />,
          title: "No recordings found",
          description: "Recorded meetings and transcripts will be stored here.",
        };
      default:
        return {
          icon: <Calendar className="w-8 h-8 text-[#9AA0A6]" />,
          title: "No meetings found",
          description: "",
        };
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
        );

        const recordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        setRecordings(recordings);
      } catch {
        toast({ title: "Unable to load recordings" });
      }
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings, toast]);

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const emptyState = getEmptyStateDetails();

  if (!calls || calls.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-[#28292C]/40 border border-[#3C4043]">
        <div className="w-16 h-16 rounded-full bg-[#303134] flex items-center justify-center">
          {emptyState.icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-normal text-[#E8EAED]">{emptyState.title}</h2>
          <p className="text-sm text-[#9AA0A6] max-w-sm">{emptyState.description}</p>
        </div>
        {type === "upcoming" && (
          <Button
            onClick={() => router.push("/")}
            className="rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs px-6 h-10 mt-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule a meeting</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {calls.map((meeting: Call | CallRecording) => (
        <MeetingCard
          key={(meeting as Call).id || (meeting as CallRecording).filename}
          title={
            (meeting as Call).state?.custom?.description ||
            (meeting as CallRecording).filename?.substring(0, 30) ||
            "Baithak Meeting"
          }
          date={
            (meeting as Call).state?.startsAt
              ? new Date((meeting as Call).state.startsAt!).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : (meeting as CallRecording).start_time
              ? new Date((meeting as CallRecording).start_time).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Instant Call"
          }
          isPreviousMeeting={type === "ended"}
          link={
            type === "recordings"
              ? (meeting as CallRecording).url
              : `${process.env.NEXT_PUBLIC_BASE_URL || window?.location?.origin || ""}/meeting/${
                  (meeting as Call).id
                }`
          }
          buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
          buttonText={type === "recordings" ? "Play" : "Start"}
          handleClick={
            type === "recordings"
              ? () => router.push(`${(meeting as CallRecording).url}`)
              : () => router.push(`/meeting/${(meeting as Call).id}`)
          }
        />
      ))}
    </div>
  );
};

export default CallList;

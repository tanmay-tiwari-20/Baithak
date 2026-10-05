"use client";

import { useState } from "react";
import { DoorClosed, DoorOpen, LoaderCircle, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";
import { respondToMeetingAdmission, setMeetingQuickAccess } from "@/actions/stream.actions";

const MeetingAdmissionControls = ({ compact = false }: { compact?: boolean }) => {
  const { call, isHost, quickAccess, pendingRequests } = useMeetingAccess();
  const [busyUserId, setBusyUserId] = useState<string>();
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();
  const callType = call?.type === "baithak" || call?.type === "default" ? call.type : undefined;

  if (!call || !callType || !isHost) return null;

  const toggleAccess = async () => {
    setIsToggling(true);
    try {
      await setMeetingQuickAccess(call.id, !quickAccess, callType);
      toast({ title: quickAccess ? "Meeting locked" : "Meeting opened" });
    } catch (error) {
      console.error("Unable to change meeting access", error);
      toast({ title: "Could not change meeting access" });
    } finally {
      setIsToggling(false);
    }
  };

  const respond = async (userId: string, approved: boolean) => {
    setBusyUserId(userId);
    try {
      await respondToMeetingAdmission(call.id, userId, approved, callType);
      toast({ title: approved ? "Guest admitted" : "Request declined" });
    } catch (error) {
      console.error("Unable to update join request", error);
      toast({ title: "Could not update join request" });
    } finally {
      setBusyUserId(undefined);
    }
  };

  return (
    <div className={compact ? "space-y-3" : "w-full rounded-2xl border border-[#3C4043] bg-[#202124] p-4 space-y-4"}>
      {!compact && (
        <div>
          <h2 className="text-sm font-medium text-[#E8EAED]">Host controls</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#9AA0A6]">
            Keep the door closed and admit people one at a time, or open access for anyone with the link.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={toggleAccess}
        disabled={isToggling}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#3C4043] bg-[#28292C] px-3.5 py-3 text-left transition-colors hover:bg-[#303134] disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${quickAccess ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>
            {isToggling ? <LoaderCircle className="size-4 animate-spin" /> : quickAccess ? <DoorOpen className="size-4" /> : <DoorClosed className="size-4" />}
          </span>
          <span>
            <span className="block text-sm font-medium text-[#E8EAED]">{quickAccess ? "Quick access is on" : "Quick access is off"}</span>
            <span className="mt-0.5 block text-xs text-[#9AA0A6]">{quickAccess ? "Anyone with the link can enter" : "You approve each new guest"}</span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-[#3C4043] px-3 py-1.5 text-xs font-medium text-[#E8EAED]">
          {quickAccess ? "Close" : "Open"}
        </span>
      </button>

      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-[#9AA0A6]">Waiting to join</h3>
            <span className="rounded-full bg-[#8AB4F8]/15 px-2 py-0.5 text-xs font-medium text-[#AECBFA]">
              {pendingRequests.length}
            </span>
          </div>
          {pendingRequests.map((request) => (
            <div key={request.user_id} className="flex items-center gap-2 rounded-xl bg-[#28292C] p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3C4043] text-sm font-medium text-[#E8EAED]">
                {(request.name || "G").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#E8EAED]">{request.name || "Guest"}</p>
                <p className="text-xs text-[#9AA0A6]">Wants to join</p>
              </div>
              <button
                type="button"
                title="Admit guest"
                disabled={busyUserId === request.user_id}
                onClick={() => respond(request.user_id, true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8AB4F8] text-[#202124] transition-colors hover:bg-[#AECBFA] disabled:opacity-50"
              >
                {busyUserId === request.user_id ? <LoaderCircle className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
              </button>
              <button
                type="button"
                title="Decline request"
                disabled={busyUserId === request.user_id}
                onClick={() => respond(request.user_id, false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#BDC1C6] transition-colors hover:bg-[#3C4043] hover:text-white disabled:opacity-50"
              >
                <UserX className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingAdmissionControls;

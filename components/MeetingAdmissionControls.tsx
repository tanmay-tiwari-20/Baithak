"use client";

import { useState } from "react";
import { AlertCircle, DoorClosed, DoorOpen, LoaderCircle, UserCheck, UserX, UsersRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";
import { respondToMeetingAdmission, setMeetingQuickAccess } from "@/actions/stream.actions";

const MeetingAdmissionControls = ({ compact = false }: { compact?: boolean }) => {
  const { call, isHost, quickAccess, pendingRequests } = useMeetingAccess();
  const [busyUserId, setBusyUserId] = useState<string>();
  const [isToggling, setIsToggling] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const { toast } = useToast();
  const callType = call?.type === "baithak" || call?.type === "default" ? call.type : undefined;

  if (!call || !callType || !isHost) return null;

  const toggleAccess = async () => {
    if (isToggling) return;
    setIsToggling(true);
    setActionError(undefined);
    try {
      await setMeetingQuickAccess(call.id, !quickAccess, callType);
      toast({ title: quickAccess ? "Meeting locked" : "Meeting opened" });
    } catch (error) {
      console.error("Unable to change meeting access", error);
      setActionError("Access could not be changed. Check your connection and try again.");
      toast({ title: "Could not change meeting access", description: "Check your connection and try again." });
    } finally {
      setIsToggling(false);
    }
  };

  const respond = async (userId: string, approved: boolean) => {
    if (busyUserId) return;
    setBusyUserId(userId);
    setActionError(undefined);
    try {
      await respondToMeetingAdmission(call.id, userId, approved, callType);
      toast({ title: approved ? "Guest admitted" : "Request declined" });
    } catch (error) {
      console.error("Unable to update join request", error);
      setActionError("That request could not be updated. Check your connection and try again.");
      toast({ title: "Could not update join request", description: "Check your connection and try again." });
    } finally {
      setBusyUserId(undefined);
    }
  };

  return (
    <div className={compact ? "space-y-3" : "w-full space-y-5 rounded-[1.35rem] border border-white/[0.09] bg-[#171a21] p-5 shadow-xl shadow-black/20"}>
      {!compact && (
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#8AB4F8]/10 text-[#AECBFA]">
            <UsersRound className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#E8EAED]">Host controls</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#9AA0A6]">
              Choose whether guests enter immediately or wait for your approval.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleAccess}
        disabled={isToggling}
        aria-pressed={quickAccess}
        aria-busy={isToggling}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#20242c] px-3.5 py-3 text-left transition-colors hover:border-white/[0.16] hover:bg-[#252a33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-wait disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${quickAccess ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>
            {isToggling ? <LoaderCircle className="size-4 animate-spin" /> : quickAccess ? <DoorOpen className="size-4" /> : <DoorClosed className="size-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#E8EAED]">{quickAccess ? "Open access" : "Host approval"}</span>
            <span className="mt-0.5 block text-xs text-[#9AA0A6]">{quickAccess ? "Anyone with the link can enter" : "You approve each new guest"}</span>
          </span>
        </span>
        <span className="shrink-0 rounded-lg border border-white/10 bg-[#2a303a] px-3 py-1.5 text-xs font-semibold text-[#E8EAED]">
          {isToggling ? "Saving…" : quickAccess ? "Close" : "Open"}
        </span>
      </button>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-[#F28B82]/25 bg-[#F28B82]/10 px-3 py-3 text-xs leading-5 text-[#F6AEA8]" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="space-y-3 border-t border-white/[0.08] pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">Waiting to join</h3>
              <p className="mt-1 text-xs text-[#747984]">Review each guest before admitting them.</p>
            </div>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#8AB4F8]/15 text-xs font-semibold text-[#AECBFA]">
              {pendingRequests.length}
            </span>
          </div>
          {pendingRequests.map((request) => (
            <div key={request.user_id} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#20242c] p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#303641] text-sm font-semibold text-[#E8EAED]">
                {(request.name || "G").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#E8EAED]">{request.name || "Guest"}</p>
                <p className="mt-0.5 text-xs text-[#9AA0A6]">Requesting access</p>
              </div>
              <button
                type="button"
                title={`Admit ${request.name || "guest"}`}
                aria-label={`Admit ${request.name || "guest"}`}
                disabled={!!busyUserId}
                onClick={() => respond(request.user_id, true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#AECBFA] text-[#101216] transition-colors hover:bg-[#D2E3FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-wait disabled:opacity-50"
              >
                {busyUserId === request.user_id ? <LoaderCircle className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
              </button>
              <button
                type="button"
                title={`Decline ${request.name || "guest"}`}
                aria-label={`Decline ${request.name || "guest"}`}
                disabled={!!busyUserId}
                onClick={() => respond(request.user_id, false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#BDC1C6] transition-colors hover:bg-[#303641] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-wait disabled:opacity-50"
              >
                <UserX className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {pendingRequests.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.1] px-3.5 py-3 text-xs text-[#8B909A]">
          <UserCheck className="size-4 shrink-0 text-[#8AB4F8]" />
          No guests are waiting right now.
        </div>
      )}
    </div>
  );
};

export default MeetingAdmissionControls;

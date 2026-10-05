"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { User, Copy, Check, Video, ShieldCheck, Link2, ArrowUpRight } from "lucide-react";
import { ensureBaithakCallType, getOrCreatePersonalRoomCode } from "@/actions/stream.actions";

const InfoRow = ({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) => (
  <div className="flex flex-col gap-2 border-b border-white/[0.07] py-4 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider min-w-[140px]">
      {label}
    </span>
    <span className={`break-all text-sm text-[#E8EAED] sm:text-right ${monospace ? "font-mono tracking-[0.12em]" : ""}`}>
      {value}
    </span>
  </div>
);

const PersonalRoom = () => {
  const { user, isLoaded } = useUser();
  const [roomCode, setRoomCode] = useState("");
  const [isLoadingRoomCode, setIsLoadingRoomCode] = useState(true);
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/+$/, "");
  const meetingLink = roomCode
    ? `${baseUrl}/meeting/${encodeURIComponent(roomCode)}?personal=true`
    : "";
  const { toast } = useToast();
  const client = useStreamVideoClient();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const displayName = user?.fullName || user?.username || user?.firstName || "Personal";

  useEffect(() => {
    let cancelled = false;
    if (!isLoaded) return;
    if (!user?.id) {
      setRoomCode("");
      setIsLoadingRoomCode(false);
      return;
    }

    setRoomCode("");
    setIsLoadingRoomCode(true);
    void getOrCreatePersonalRoomCode()
      .then((code) => {
        if (!cancelled) setRoomCode(code);
      })
      .catch((error) => {
        console.error("Unable to load personal room code", error);
        if (!cancelled) toast({ title: "Could not load your personal room code" });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoomCode(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id, toast]);

  const startRoom = async () => {
    if (!client || !user || !roomCode || isStarting) return;
    setIsStarting(true);
    try {
      await ensureBaithakCallType();
      const newCall = client.call("baithak", roomCode);
      const { call: room } = await newCall.getOrCreate({
        data: {
          custom: {
            description: `${displayName}'s Personal Room`,
            quick_access: false,
            pending_requests: [],
            admission_statuses: {},
          },
          members: [{ user_id: user.id, role: "admin" }],
        },
      });
      // Keep the persistent room label in sync if the user's display name changes.
      await newCall.update({
        custom: {
          ...(room.custom || {}),
          description: `${displayName}'s Personal Room`,
        },
      });
      router.push(`/meeting/${encodeURIComponent(roomCode)}?personal=true`);
    } catch (error) {
      console.error("Unable to start personal room", error);
      toast({ title: "Could not start your personal room", description: "Please try again." });
    } finally {
      setIsStarting(false);
    }
  };

  const copyLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      toast({ title: "Personal room link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy the room link" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-[#E8EAED]">
      <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#242831] to-[#1b1e25] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
            <User className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#AECBFA]">Always available</p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-[#E8EAED] sm:text-3xl">
              Your personal room
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#9AA0A6]">
              A permanent meeting link for quick calls. Share it once and use the same room whenever you need it.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#1c1f27] shadow-xl shadow-black/10">
        <div className="flex flex-col gap-5 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
              <User className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium text-[#E8EAED]">{displayName}</h2>
              <p className="text-xs text-[#9AA0A6]">Dedicated meeting room</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8">
          <InfoRow label="Room name" value={`${displayName}'s Personal Room`} />
          <InfoRow
            label="Room code"
            value={roomCode || (isLoadingRoomCode ? "Creating your room code…" : "Unavailable")}
            monospace
          />
          <div className="flex flex-col gap-2 border-b border-white/[0.07] py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#9AA0A6]">
              <Link2 className="size-4" /> Invitation link
            </span>
            <span className="break-all text-sm text-[#AECBFA] sm:text-right">
              {meetingLink || (isLoadingRoomCode ? "Preparing your invitation…" : "Unavailable")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:p-8">
          <Button
            onClick={startRoom}
            disabled={!user || !client || !roomCode || isStarting}
            className="h-11 w-full rounded-full bg-[#8AB4F8] px-6 font-medium text-[#111318] hover:bg-[#AECBFA] disabled:opacity-60 sm:w-auto"
          >
            <Video className="mr-2 size-4" />
            {isStarting ? "Opening room…" : "Start a meeting"}
            {!isStarting && <ArrowUpRight className="ml-2 size-4" />}
          </Button>
          <Button
            onClick={copyLink}
            disabled={!user || !roomCode}
            variant="outline"
            className="h-11 w-full rounded-full border-white/15 bg-transparent px-6 text-[#DADCE0] hover:bg-white/[0.06] sm:w-auto"
          >
            {copied ? <Check className="mr-2 size-4 text-[#AECBFA]" /> : <Copy className="mr-2 size-4" />}
            {copied ? "Copied" : "Copy invitation"}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#1b1e25]/70 p-4 text-xs leading-relaxed text-[#9AA0A6] sm:p-5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#8AB4F8]" />
        <span>Guests use the shared link to request access. You can admit them from the room’s host controls.</span>
      </div>
    </div>
  );
};

export default PersonalRoom;

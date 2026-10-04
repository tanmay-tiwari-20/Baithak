"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { User, Copy, Check, Video, ShieldCheck } from "lucide-react";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#3C4043]/60 gap-2">
    <span className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider min-w-[140px]">
      {label}
    </span>
    <span className="text-sm font-mono text-[#E8EAED] break-all sm:text-right">
      {value}
    </span>
  </div>
);

const PersonalRoom = () => {
  const { user } = useUser();
  const meetingId = user?.id || "";
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")}/meeting/${meetingId}?personal=true`;
  const { toast } = useToast();
  const client = useStreamVideoClient();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { call } = useGetCallById(meetingId);

  const startRoom = async () => {
    if (!client || !user) return;

    const newCall = client.call("default", meetingId);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: `${user.username || user.firstName || "Personal"}'s Meeting Room`,
          },
        },
      });
    }
    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast({ title: "Invitation Link Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl text-[#E8EAED]">
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-[#E8EAED]">
          Personal Meeting Room
        </h1>
        <p className="text-sm text-[#9AA0A6] mt-1">
          Your personal room is always ready for instant 1-on-1s and quick syncs with a permanent link.
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl bg-[#28292C] border border-[#3C4043] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#3C4043]">
          <div className="w-10 h-10 rounded-full bg-[#1A73E8]/20 flex items-center justify-center text-[#8AB4F8]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#E8EAED]">
              {user?.fullName || user?.username || "Personal Room"}
            </h2>
            <p className="text-xs text-[#9AA0A6]">Dedicated meeting room</p>
          </div>
        </div>

        <div className="space-y-1">
          <InfoRow
            label="Topic"
            value={`${user?.username || user?.firstName || "Host"}'s Personal Room`}
          />
          <InfoRow label="Meeting ID" value={meetingId} />
          <InfoRow label="Invite Link" value={meetingLink} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <Button
            onClick={startRoom}
            className="w-full sm:w-auto h-11 px-8 rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium text-sm flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Start Meeting</span>
          </Button>

          <Button
            onClick={copyLink}
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-full border border-[#5F6368] text-[#8AB4F8] hover:bg-[#303134] font-medium text-sm flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Link Copied" : "Copy Invitation"}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#9AA0A6]">
        <ShieldCheck className="w-4 h-4 text-[#8AB4F8]" />
        <span>Meetings in your personal room are protected with enterprise encryption.</span>
      </div>
    </div>
  );
};

export default PersonalRoom;

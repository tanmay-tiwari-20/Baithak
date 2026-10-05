"use client";

import React, { useState } from "react";
import { useToast } from "./ui/use-toast";
import { CalendarClock, Check, Clock3, Copy, Download, Video } from "lucide-react";
import { Button } from "./ui/button";

type MeetingCardProps = {
  title: string;
  date: string;
  kind: "upcoming" | "previous" | "recording";
  actionText?: string;
  handleClick: () => void;
  link: string;
};

const cardStyle = {
  upcoming: {
    label: "Upcoming meeting",
    icon: CalendarClock,
  },
  previous: {
    label: "Previous meeting",
    icon: Clock3,
  },
  recording: {
    label: "Recording",
    icon: Video,
  },
};

const MeetingCard = ({ title, date, kind, actionText, handleClick, link }: MeetingCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const appearance = cardStyle[kind];
  const Icon = appearance.icon;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: kind === "recording" ? "Recording link copied" : "Meeting link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy the link" });
    }
  };

  return (
    <article className="group flex min-h-[218px] flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#1c1f27] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#20242d] sm:p-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#AECBFA]">{appearance.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyLink}
            title={kind === "recording" ? "Copy recording link" : "Copy meeting link"}
            aria-label={kind === "recording" ? "Copy recording link" : "Copy meeting link"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#9AA0A6] transition-colors hover:bg-white/[0.07] hover:text-[#E8EAED]"
          >
            {copied ? <Check className="size-4 text-[#AECBFA]" /> : <Copy className="size-4" />}
          </button>
        </div>

        <div>
          <h3 className="line-clamp-2 min-h-12 text-lg font-medium leading-6 text-[#F1F3F4]">{title}</h3>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#9AA0A6]">
            <Clock3 className="size-3.5 shrink-0" />
            <span>{date}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
        <span className="truncate text-xs text-[#747984]">{kind === "recording" ? "Saved meeting recording" : "Baithak meeting room"}</span>
        {actionText && (
          <Button
            onClick={handleClick}
            className="h-9 shrink-0 rounded-full bg-[#8AB4F8] px-4 text-xs font-medium text-[#111318] hover:bg-[#AECBFA]"
          >
            {kind === "recording" && <Download className="mr-1.5 size-3.5" />}
            {actionText}
          </Button>
        )}
      </div>
    </article>
  );
};

export default MeetingCard;

"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Calendar, Clock, Video, Copy, Play, Check } from "lucide-react";

interface MeetingCardProps {
  title: string;
  date: string;
  icon?: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  title,
  date,
  isPreviousMeeting,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Meeting Link Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#28292C] border border-[#3C4043] hover:border-[#5F6368] transition-all flex flex-col justify-between min-h-[190px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#303134] flex items-center justify-center text-[#8AB4F8]">
              {isPreviousMeeting ? (
                <Clock className="w-4 h-4" />
              ) : buttonText === "Play" ? (
                <Video className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs font-medium text-[#9AA0A6]">
              {isPreviousMeeting
                ? "Past Meeting"
                : buttonText === "Play"
                ? "Recording"
                : "Scheduled Call"}
            </span>
          </div>
          
          <button
            onClick={copyLink}
            title="Copy meeting link"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#8AB4F8]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-[#E8EAED] line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-[#9AA0A6] mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{date || "Instant Call"}</span>
          </p>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-2 border-t border-[#3C4043]/60">
        {!isPreviousMeeting && (
          <Button
            onClick={handleClick}
            className="rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-medium px-5 h-9"
          >
            {buttonText === "Play" && <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />}
            {buttonText || "Start"}
          </Button>
        )}

        <Button
          onClick={copyLink}
          variant="ghost"
          className="rounded-full text-xs text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134] h-9 px-4"
        >
          {copied ? "Link Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
};

export default MeetingCard;
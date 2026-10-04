/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Video,
  Plus,
  Link as LinkIcon,
  Calendar,
  Keyboard,
  Clock,
  PlaySquare,
  Copy,
  Check,
  Shield,
  ArrowRight,
} from "lucide-react";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | "isMeetingLater" | undefined
  >();

  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setCallDetails] = useState<Call>();
  const [createdLaterCall, setCreatedLaterCall] = useState<Call>();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;

    try {
      if (!values.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create call");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({ title: "Meeting Created" });
    } catch (error) {
      console.log(error);
      toast({ title: "Failed to create meeting" });
    }
  };

  const createMeetingForLater = async () => {
    if (!client || !user) return;

    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create call");

      await call.getOrCreate({
        data: {
          starts_at: new Date(Date.now()).toISOString(),
          custom: {
            description: "Quick Meeting",
          },
        },
      });

      setCreatedLaterCall(call);
      setMeetingState("isMeetingLater");
    } catch (error) {
      console.log(error);
      toast({ title: "Failed to create meeting link" });
    }
  };

  const cleanAndJoinLink = () => {
    if (!values.link.trim()) return;

    let target = values.link.trim();
    if (target.startsWith("http")) {
      try {
        const url = new URL(target);
        target = url.pathname;
      } catch {
        // If not valid URL, keep string
      }
    }

    if (!target.startsWith("/meeting/")) {
      target = `/meeting/${target}`;
    }

    router.push(target);
  };

  const scheduledMeetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || window?.location?.origin || ""}/meeting/${callDetails?.id}`;
  const laterMeetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || window?.location?.origin || ""}/meeting/${createdLaterCall?.id}`;

  return (
    <div className="space-y-10">
      {/* Google Meet Signature Action Row: [ + New meeting ] & [ ⌨️ Enter a code or link ] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-2xl">
        {/* + New meeting Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium text-sm transition-colors shadow-sm select-none">
              <Video className="w-5 h-5" />
              <span>New meeting</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 bg-[#28292C] border border-[#3C4043] text-[#E8EAED] rounded-xl p-1.5 shadow-xl"
          >
            <DropdownMenuItem
              onClick={createMeetingForLater}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-[#303134] focus:bg-[#303134] text-[#E8EAED]"
            >
              <LinkIcon className="w-4 h-4 text-[#8AB4F8]" />
              <span>Create a meeting for later</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMeetingState("isInstantMeeting")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-[#303134] focus:bg-[#303134] text-[#E8EAED]"
            >
              <Plus className="w-4 h-4 text-[#8AB4F8]" />
              <span>Start an instant meeting</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMeetingState("isScheduleMeeting")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-[#303134] focus:bg-[#303134] text-[#E8EAED]"
            >
              <Calendar className="w-4 h-4 text-[#8AB4F8]" />
              <span>Schedule in Baithak Calendar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Enter a code or link input field */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA0A6]" />
            <Input
              type="text"
              placeholder="Enter a code or link"
              value={values.link}
              onChange={(e) => setValues({ ...values, link: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && cleanAndJoinLink()}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-transparent border border-[#5F6368] focus-visible:border-[#8AB4F8] focus-visible:ring-1 focus-visible:ring-[#8AB4F8] text-[#E8EAED] placeholder:text-[#9AA0A6] text-sm h-12"
            />
          </div>
          <button
            onClick={cleanAndJoinLink}
            disabled={!values.link.trim()}
            className="px-5 py-3 rounded-full text-sm font-medium transition-colors disabled:text-[#5F6368] disabled:cursor-not-allowed text-[#8AB4F8] hover:bg-[#303134]"
          >
            Join
          </button>
        </div>
      </div>

      {/* Minimal Google Workspace Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Card 1: Start Instant */}
        <div
          onClick={() => setMeetingState("isInstantMeeting")}
          className="p-5 rounded-2xl bg-[#28292C] border border-[#3C4043] hover:bg-[#303134] hover:border-[#5F6368] transition-all cursor-pointer flex flex-col justify-between h-44 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1A73E8]/20 flex items-center justify-center text-[#8AB4F8]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Instant Meeting
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Start a call right now with one click
            </p>
          </div>
        </div>

        {/* Card 2: Schedule Meeting */}
        <div
          onClick={() => setMeetingState("isScheduleMeeting")}
          className="p-5 rounded-2xl bg-[#28292C] border border-[#3C4043] hover:bg-[#303134] hover:border-[#5F6368] transition-all cursor-pointer flex flex-col justify-between h-44 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1A73E8]/20 flex items-center justify-center text-[#8AB4F8]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Schedule Meeting
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Plan your calls with date and time
            </p>
          </div>
        </div>

        {/* Card 3: Upcoming Calls */}
        <div
          onClick={() => router.push("/upcoming")}
          className="p-5 rounded-2xl bg-[#28292C] border border-[#3C4043] hover:bg-[#303134] hover:border-[#5F6368] transition-all cursor-pointer flex flex-col justify-between h-44 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1A73E8]/20 flex items-center justify-center text-[#8AB4F8]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Upcoming Calls
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              View all scheduled appointments
            </p>
          </div>
        </div>

        {/* Card 4: Recordings */}
        <div
          onClick={() => router.push("/recordings")}
          className="p-5 rounded-2xl bg-[#28292C] border border-[#3C4043] hover:bg-[#303134] hover:border-[#5F6368] transition-all cursor-pointer flex flex-col justify-between h-44 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1A73E8]/20 flex items-center justify-center text-[#8AB4F8]">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              View Recordings
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Play and review past recorded calls
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Schedule Meeting */}
      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Schedule a Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#9AA0A6]">
              Meeting Title or Topic
            </label>
            <Textarea
              placeholder="e.g. Weekly Product Sync"
              className="border border-[#3C4043] bg-[#202124] text-[#E8EAED] placeholder:text-[#5F6368] focus-visible:ring-1 focus-visible:ring-[#8AB4F8] rounded-xl text-sm min-h-[75px]"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-medium text-[#9AA0A6]">
              Select Date & Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded-xl border border-[#3C4043] bg-[#202124] p-3 text-[#E8EAED] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] text-sm"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => {
            setMeetingState(undefined);
            setCallDetails(undefined);
          }}
          title="Meeting Scheduled"
          handleClick={() => {
            navigator.clipboard.writeText(scheduledMeetingLink);
            toast({ title: "Invitation Link Copied" });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          buttonText={copied ? "Copied!" : "Copy Meeting Link"}
        >
          <div className="p-4 rounded-xl bg-[#202124] border border-[#3C4043] space-y-2">
            <p className="text-xs text-[#9AA0A6]">Share this link with your team:</p>
            <p className="text-sm font-mono text-[#8AB4F8] break-all select-all">
              {scheduledMeetingLink}
            </p>
          </div>
        </MeetingModal>
      )}

      {/* Modal: Meeting Created For Later (Google Meet Signature) */}
      <MeetingModal
        isOpen={meetingState === "isMeetingLater"}
        onClose={() => {
          setMeetingState(undefined);
          setCreatedLaterCall(undefined);
        }}
        title="Here's the link to your meeting"
        handleClick={() => {
          navigator.clipboard.writeText(laterMeetingLink);
          toast({ title: "Link copied to clipboard" });
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        buttonText={copied ? "Copied!" : "Copy Link"}
      >
        <div className="space-y-3">
          <p className="text-sm text-[#9AA0A6]">
            Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
          </p>
          <div className="p-3.5 rounded-xl bg-[#202124] border border-[#3C4043] flex items-center justify-between gap-2">
            <p className="text-sm font-mono text-[#E8EAED] truncate">
              {laterMeetingLink}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(laterMeetingLink);
                toast({ title: "Link copied" });
              }}
              className="text-[#8AB4F8] hover:text-white p-1 rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </MeetingModal>

      {/* Modal: Instant Meeting confirmation */}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        buttonText="Join Meeting"
        handleClick={createMeeting}
      >
        <p className="text-sm text-[#9AA0A6]">
          Your camera and mic will be configured on the next screen before anyone else sees you.
        </p>
      </MeetingModal>
    </div>
  );
};

export default MeetingTypeList;

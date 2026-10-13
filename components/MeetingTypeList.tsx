"use client";

import { useState } from "react";
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
} from "lucide-react";
import { createMeetingCode, getMeetingIdFromInput } from "@/lib/meeting-code";
import { ensureBaithakCallType } from "@/actions/stream.actions";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isInstantMeeting" | "isMeetingLater" | undefined
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user || isSubmitting) return;

    try {
      const isScheduled = meetingState === "isScheduleMeeting";
      if (isScheduled && (!values.dateTime || values.dateTime <= new Date())) {
        toast({ title: "Choose a future date and time" });
        return;
      }

      setIsSubmitting(true);
      await ensureBaithakCallType();
      const id = createMeetingCode();
      const call = client.call("baithak", id);
      if (!call) throw new Error("Failed to create call");

      await call.getOrCreate({
        data: {
          ...(isScheduled ? { starts_at: values.dateTime.toISOString() } : {}),
          custom: {
            description: isScheduled
              ? values.description.trim() || "Scheduled meeting"
              : "Instant meeting",
            quick_access: false,
            pending_requests: [],
            admission_statuses: {},
          },
          members: [{ user_id: user.id, role: "admin" }],
        },
      });

      setCallDetails(call);

      if (!isScheduled) {
        router.push(`/meeting/${call.id}`);
      }
      toast({ title: "Meeting Created" });
    } catch (error) {
      console.error("Failed to create meeting", error);
      toast({ title: "Failed to create meeting" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createMeetingForLater = async () => {
    if (!client || !user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await ensureBaithakCallType();
      const id = createMeetingCode();
      const call = client.call("baithak", id);
      if (!call) throw new Error("Failed to create call");

      await call.getOrCreate({
        data: {
          custom: {
            description: "Meeting",
            quick_access: false,
            pending_requests: [],
            admission_statuses: {},
          },
          members: [{ user_id: user.id, role: "admin" }],
        },
      });

      setCreatedLaterCall(call);
      setMeetingState("isMeetingLater");
    } catch (error) {
      console.error("Failed to create meeting link", error);
      toast({ title: "Failed to create meeting link" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanAndJoinLink = async () => {
    if (!client || isSubmitting) return;
    const meetingId = getMeetingIdFromInput(values.link);
    if (!meetingId) {
      toast({ title: "Enter a valid Baithak meeting code or link" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { calls } = await client.queryCalls({
        filter_conditions: { id: meetingId },
        limit: 1,
      });
      if (calls.length === 0) {
        toast({ title: "Meeting not found", description: "Check the code or ask the host for a new link." });
        return;
      }
      router.push(`/meeting/${encodeURIComponent(meetingId)}`);
    } catch (error) {
      console.error("Failed to find meeting", error);
      toast({ title: "Unable to join meeting", description: "Please try again in a moment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");
  const scheduledMeetingLink = `${baseUrl}/meeting/${callDetails?.id}`;
  const laterMeetingLink = `${baseUrl}/meeting/${createdLaterCall?.id}`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#1A73E8] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1557B0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1B1E]">
              <Video className="size-5" />
              <span>New meeting</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 rounded-xl border border-[#3C4043] bg-[#28292C] p-1.5 text-[#E8EAED] shadow-xl"
          >
            <DropdownMenuItem
              onClick={createMeetingForLater}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#E8EAED] hover:bg-[#303134] focus:bg-[#303134]"
            >
              <LinkIcon className="w-4 h-4 text-[#8AB4F8]" />
              <span>Create a meeting for later</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMeetingState("isInstantMeeting")}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#E8EAED] hover:bg-[#303134] focus:bg-[#303134]"
            >
              <Plus className="w-4 h-4 text-[#8AB4F8]" />
              <span>Start an instant meeting</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMeetingState("isScheduleMeeting")}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#E8EAED] hover:bg-[#303134] focus:bg-[#303134]"
            >
              <Calendar className="w-4 h-4 text-[#8AB4F8]" />
              <span>Schedule in Baithak Calendar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="relative flex-1">
            <Keyboard className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9AA0A6]" />
            <Input
              type="text"
              placeholder="Enter a code or link"
              value={values.link}
              onChange={(e) => setValues({ ...values, link: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && cleanAndJoinLink()}
              className="h-12 w-full rounded-xl border border-[#5F6368] bg-[#202124] pl-10 pr-4 text-sm text-[#E8EAED] placeholder:text-[#9AA0A6] focus-visible:border-[#8AB4F8] focus-visible:ring-1 focus-visible:ring-[#8AB4F8]"
            />
          </div>
          <button
            type="button"
            onClick={cleanAndJoinLink}
            disabled={!values.link.trim() || isSubmitting}
            className="h-12 rounded-xl border border-[#3C4043] px-5 text-sm font-medium text-[#AECBFA] transition-colors hover:bg-[#303134] disabled:cursor-not-allowed disabled:text-[#5F6368] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
          >
            {isSubmitting ? "Joining…" : "Join"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setMeetingState("isInstantMeeting")}
          className="group flex min-h-[156px] cursor-pointer flex-col justify-between rounded-2xl border border-[#3C4043] bg-[#28292C] p-5 text-left transition-colors hover:border-[#5F6368] hover:bg-[#303134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#3C4043] bg-[#202124] text-[#AECBFA]">
            <Video className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Instant Meeting
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Start a call right now with one click
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMeetingState("isScheduleMeeting")}
          className="group flex min-h-[156px] cursor-pointer flex-col justify-between rounded-2xl border border-[#3C4043] bg-[#28292C] p-5 text-left transition-colors hover:border-[#5F6368] hover:bg-[#303134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#3C4043] bg-[#202124] text-[#AECBFA]">
            <Calendar className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Schedule Meeting
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Plan your calls with date and time
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/upcoming")}
          className="group flex min-h-[156px] cursor-pointer flex-col justify-between rounded-2xl border border-[#3C4043] bg-[#28292C] p-5 text-left transition-colors hover:border-[#5F6368] hover:bg-[#303134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#3C4043] bg-[#202124] text-[#AECBFA]">
            <Clock className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              Upcoming Calls
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              View all scheduled appointments
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/recordings")}
          className="group flex min-h-[156px] cursor-pointer flex-col justify-between rounded-2xl border border-[#3C4043] bg-[#28292C] p-5 text-left transition-colors hover:border-[#5F6368] hover:bg-[#303134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#3C4043] bg-[#202124] text-[#AECBFA]">
            <PlaySquare className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#E8EAED] group-hover:text-white">
              View Recordings
            </h3>
            <p className="text-xs text-[#9AA0A6] mt-1">
              Play and review past recorded calls
            </p>
          </div>
        </button>
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
            <p className="text-xs text-[#9AA0A6] pt-2">Meeting code</p>
            <p className="text-sm font-mono text-[#E8EAED] tracking-wider select-all">
              {callDetails?.id}
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
          <div className="p-3.5 rounded-xl bg-[#202124] border border-[#3C4043] space-y-1">
            <p className="text-xs text-[#9AA0A6]">Meeting code</p>
            <p className="text-sm font-mono text-[#E8EAED] tracking-wider select-all">
              {createdLaterCall?.id}
            </p>
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

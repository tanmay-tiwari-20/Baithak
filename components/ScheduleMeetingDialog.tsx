"use client";

import { ensureBaithakCallType } from "@/actions/stream.actions";
import { useToast } from "@/hooks/use-toast";
import { createMeetingCode } from "@/lib/meeting-code";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { CalendarClock, Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type ScheduleMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled: () => void;
};

const localDateTimeValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const ScheduleMeetingDialog = ({ open, onOpenChange, onScheduled }: ScheduleMeetingDialogProps) => {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return localDateTimeValue(nextHour);
  });
  const [isSaving, setIsSaving] = useState(false);
  const [scheduled, setScheduled] = useState<{ id: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const closeDialog = (nextOpen: boolean) => {
    if (!nextOpen && !isSaving) {
      setScheduled(null);
      setTitle("");
    }
    onOpenChange(nextOpen);
  };

  const scheduleMeeting = async () => {
    if (!client || !user || isSaving) return;
    const startDate = new Date(startsAt);
    if (!startsAt || Number.isNaN(startDate.getTime()) || startDate <= new Date()) {
      toast({ title: "Choose a future date and time" });
      return;
    }

    const meetingTitle = title.trim() || "Scheduled meeting";
    setIsSaving(true);
    try {
      await ensureBaithakCallType();
      const id = createMeetingCode();
      const call = client.call("baithak", id);
      await call.getOrCreate({
        data: {
          starts_at: startDate.toISOString(),
          custom: {
            description: meetingTitle,
            quick_access: false,
            pending_requests: [],
            admission_statuses: {},
          },
          members: [{ user_id: user.id, role: "admin" }],
        },
      });
      setScheduled({ id: call.id, title: meetingTitle });
      onScheduled();
      toast({ title: "Meeting scheduled", description: meetingTitle });
    } catch (error) {
      console.error("Failed to schedule meeting", error);
      toast({ title: "Could not schedule meeting", description: "Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const meetingUrl = typeof window === "undefined" || !scheduled
    ? ""
    : `${window.location.origin}/meeting/${scheduled.id}`;

  const copyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      toast({ title: "Invitation copied" });
    } catch {
      toast({ title: "Could not copy the invitation" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-white/10 bg-[#1c1f27] p-6 text-[#E8EAED] shadow-2xl sm:p-8">
        <DialogTitle className="flex items-center gap-3 pr-8 text-xl font-medium">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
            {scheduled ? <Check className="size-5" /> : <CalendarClock className="size-5" />}
          </span>
          {scheduled ? "Your meeting is scheduled" : "Schedule a meeting"}
        </DialogTitle>

        {scheduled ? (
          <div className="space-y-5">
            <div>
              <p className="font-medium text-[#E8EAED]">{scheduled.title}</p>
              <p className="mt-1 text-sm text-[#9AA0A6]">
                {new Date(startsAt).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111318] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#9AA0A6]">
                <Link2 className="size-4" /> Meeting link
              </div>
              <p className="break-all font-mono text-sm text-[#AECBFA]">{meetingUrl}</p>
              <p className="mt-3 text-xs text-[#9AA0A6]">Meeting code</p>
              <p className="mt-1 font-mono text-sm tracking-wider">{scheduled.id}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => closeDialog(false)} className="rounded-full text-[#BEC2CB] hover:bg-white/5">
                Done
              </Button>
              <Button onClick={copyInvitation} className="rounded-full bg-[#8AB4F8] text-[#111318] hover:bg-[#AECBFA]">
                {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                {copied ? "Copied" : "Copy invitation"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-[#9AA0A6]">
              Choose a title and start time. Your room link will be ready to share as soon as you schedule it.
            </p>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#DADCE0]">Meeting name</span>
              <Textarea
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example, Weekly team sync"
                maxLength={100}
                className="min-h-20 resize-y rounded-xl border-white/10 bg-[#111318] text-[#E8EAED] placeholder:text-[#747984] focus-visible:ring-[#8AB4F8]"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#DADCE0]">Date and time</span>
              <Input
                type="datetime-local"
                value={startsAt}
                min={localDateTimeValue(new Date())}
                onChange={(event) => setStartsAt(event.target.value)}
                className="h-11 rounded-xl border-white/10 bg-[#111318] text-[#E8EAED] [color-scheme:dark] focus-visible:ring-[#8AB4F8]"
              />
              <span className="block text-xs text-[#747984]">Times use your device’s local timezone.</span>
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => closeDialog(false)} disabled={isSaving} className="rounded-full text-[#BEC2CB] hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={scheduleMeeting} disabled={isSaving || !client || !user} className="rounded-full bg-[#8AB4F8] px-6 text-[#111318] hover:bg-[#AECBFA]">
                {isSaving ? "Scheduling…" : "Schedule"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetingDialog;

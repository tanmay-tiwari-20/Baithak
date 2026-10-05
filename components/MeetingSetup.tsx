"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Video, VideoOff, ShieldCheck } from "lucide-react";
import BaithakLogo from "./BaithakLogo";
import { useToast } from "@/hooks/use-toast";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";
import MeetingAdmissionControls from "./MeetingAdmissionControls";
import { requestMeetingAdmission } from "@/actions/stream.actions";
import { useParams } from "next/navigation";
import { Clock3, UsersRound } from "lucide-react";

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
}

const MeetingSetup = ({ setIsSetupComplete }: MeetingSetupProps) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const { toast } = useToast();
  const params = useParams();
  const meetingId = (params?.id as string) || "";
  const { isHost, isAdmitted, quickAccess, admissionStatus } = useMeetingAccess();
  const [accessGranted, setAccessGranted] = useState(false);

  const call = useCall();
  if (!call) {
    throw new Error("useCall must be used within StreamCall component");
  }

  const requiresAdmission = call.type === "baithak" || call.type === "default";
  const canJoin = !requiresAdmission || isHost || isAdmitted || accessGranted;

  // Sync camera and mic with call hardware state
  useEffect(() => {
    if (!canJoin) return;
    if (!isCamOn) {
      void call.camera.disable().catch((error) => console.error("Unable to disable camera", error));
    } else {
      void call.camera.enable().catch((error) => console.error("Unable to enable camera", error));
    }
  }, [isCamOn, canJoin, call]);

  useEffect(() => {
    if (!canJoin) return;
    if (!isMicOn) {
      void call.microphone.disable().catch((error) => console.error("Unable to disable microphone", error));
    } else {
      void call.microphone.enable().catch((error) => console.error("Unable to enable microphone", error));
    }
  }, [isMicOn, canJoin, call]);

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleCam = () => setIsCamOn((prev) => !prev);

  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      if (requiresAdmission && !isHost && !isAdmitted) {
        const result = await requestMeetingAdmission(meetingId, call.type as "baithak" | "default");
        if (result.status === "waiting") {
          setHasRequestedToJoin(true);
          toast({ title: "Request sent", description: "The host will let you in when they are ready." });
          return;
        }
        setAccessGranted(true);
        toast({ title: "You can join now", description: "Check your camera and microphone before entering." });
        return;
      }
      await call.join();
      setIsSetupComplete(true);
    } catch (error) {
      console.error("Unable to join meeting", error);
      toast({ title: "Unable to join meeting", description: "Check your connection and try again." });
    } finally {
      setIsJoining(false);
    }
  };

  if (!canJoin) {
    const isWaiting = hasRequestedToJoin && admissionStatus !== "denied" && !quickAccess;
    const heading = isWaiting
      ? "Waiting for the host"
      : quickAccess
      ? "This meeting is open"
      : admissionStatus === "denied"
      ? "The host declined your request"
      : "Ask to join this meeting";

    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#0f1117] px-5 py-10 text-[#E8EAED]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1f27] p-8 text-center shadow-2xl shadow-black/30 sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8AB4F8]/10 text-[#AECBFA]">
            {isWaiting ? <Clock3 className="size-7" /> : <UsersRound className="size-7" />}
          </div>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-[#9AA0A6]">Baithak waiting room</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">{heading}</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#A5AAB3]">
            {isWaiting
              ? "Keep this page open. Your microphone and camera stay off until you’re admitted."
              : quickAccess
              ? "Continue to the camera and microphone preview before entering."
              : admissionStatus === "denied"
              ? "You can send another request if you think this was a mistake."
              : "Your microphone and camera stay off while the host reviews your request."}
          </p>
          {!isWaiting && (
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="mt-7 h-11 rounded-full bg-[#8AB4F8] px-7 font-medium text-[#111827] hover:bg-[#AECBFA] disabled:opacity-60"
            >
              {isJoining
                ? "Sending request…"
                : quickAccess
                ? "Continue"
                : admissionStatus === "denied"
                ? "Request again"
                : "Ask to join"}
            </Button>
          )}
          <p className="mt-6 text-xs text-[#747984]">Meeting code: {meetingId}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#202124] text-[#E8EAED] flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <BaithakLogo size={32} textClassName="text-xl font-normal" />
        <div className="flex items-center gap-2 text-xs text-[#9AA0A6]">
          <ShieldCheck className="w-4 h-4 text-[#8AB4F8]" />
          <span>Pre-join settings</span>
        </div>
      </header>

      {/* Main Google Meet Pre-join Chamber */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Video Preview with Floating Controls */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#28292C] border border-[#3C4043] shadow-xl flex items-center justify-center">
              <VideoPreview className="w-full h-full object-cover" />

              {/* Camera Off Placeholder if video disabled */}
              {!isCamOn && (
                <div className="absolute inset-0 bg-[#28292C] flex flex-col items-center justify-center gap-2 text-[#9AA0A6]">
                  <div className="w-16 h-16 rounded-full bg-[#3C4043] flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-[#E8EAED]" />
                  </div>
                  <span className="text-sm font-normal">Camera is off</span>
                </div>
              )}

              {/* Bottom Floating Control Bar on Video Preview */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#202124]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#3C4043]">
                {/* Mic Button */}
                <button
                  onClick={toggleMic}
                  title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                    isMicOn
                      ? "bg-[#3C4043] text-white hover:bg-[#5F6368]"
                      : "bg-[#EA4335] text-white hover:bg-[#D93025]"
                  }`}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Camera Button */}
                <button
                  onClick={toggleCam}
                  title={isCamOn ? "Turn off camera" : "Turn on camera"}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                    isCamOn
                      ? "bg-[#3C4043] text-white hover:bg-[#5F6368]"
                      : "bg-[#EA4335] text-white hover:bg-[#D93025]"
                  }`}
                >
                  {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                {/* Device Settings Dialog Trigger */}
                <div className="text-white">
                  <DeviceSettings />
                </div>
              </div>
            </div>

            {/* Subtitle helper */}
            <p className="text-xs text-[#9AA0A6] mt-3">
              Check your audio and video before entering the meeting.
            </p>
          </div>

          {/* Right: Join Confirmation Panel */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-normal text-[#E8EAED] tracking-tight">
                Ready to join?
              </h1>
              <p className="text-sm text-[#9AA0A6]">
                Join the meeting when you&apos;re ready.
              </p>
            </div>

            {/* Join button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#8AB4F8] hover:bg-[#AECBFA] text-[#202124] font-medium text-base transition-colors disabled:opacity-60"
              >
                {isJoining ? "Joining…" : "Join now"}
              </Button>
            </div>

            <MeetingAdmissionControls />

            {/* Quick Tips */}
            <div className="pt-4 border-t border-[#3C4043] w-full text-xs text-[#9AA0A6] space-y-1">
              <p>Joining info will be available inside the call.</p>
              <p>You can turn off camera and mic at any time.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
    </div>
  );
};

export default MeetingSetup;

"use client";

import {
  DeviceSettings,
  useCall,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mic,
  MicOff,
  ShieldCheck,
  UsersRound,
  Video,
  VideoOff,
} from "lucide-react";
import BaithakLogo from "./BaithakLogo";
import { useToast } from "@/hooks/use-toast";
import { useMeetingAccess } from "@/hooks/useMeetingAccess";
import MeetingAdmissionControls from "./MeetingAdmissionControls";
import { requestMeetingAdmission } from "@/actions/stream.actions";
import { useParams } from "next/navigation";

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
}

const MeetingSetup = ({ setIsSetupComplete }: MeetingSetupProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const [deviceAction, setDeviceAction] = useState<"microphone" | "camera">();
  const [deviceError, setDeviceError] = useState<string>();
  const [joinError, setJoinError] = useState<string>();
  const { toast } = useToast();
  const params = useParams();
  const meetingId = (params?.id as string) || "";
  const { isHost, isAdmitted, quickAccess, admissionStatus } = useMeetingAccess();
  const [accessGranted, setAccessGranted] = useState(false);

  const call = useCall();
  if (!call) {
    throw new Error("useCall must be used within StreamCall component");
  }

  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const cameraState = useCameraState();
  const microphoneState = useMicrophoneState();
  const cameraIsOn = cameraState.optimisticStatus === "enabled";
  const microphoneIsOn = microphoneState.optimisticStatus === "enabled";

  const requiresAdmission = call.type === "baithak" || call.type === "default";
  const canJoin = !requiresAdmission || isHost || isAdmitted || accessGranted;

  // Sync camera and mic with call hardware state
  useEffect(() => {
    if (!canJoin) return;
    void call.camera.enable().catch((error) => {
      console.error("Unable to enable camera", error);
      setDeviceError("Camera access is unavailable. Check your browser permission or selected device.");
    });
  }, [canJoin, call]);

  useEffect(() => {
    if (!canJoin) return;
    void call.microphone.enable().catch((error) => {
      console.error("Unable to enable microphone", error);
      setDeviceError("Microphone access is unavailable. Check your browser permission or selected device.");
    });
  }, [canJoin, call]);

  const toggleMic = async () => {
    if (deviceAction) return;
    setDeviceAction("microphone");
    setDeviceError(undefined);
    try {
      if (microphoneIsOn) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
    } catch (error) {
      console.error("Unable to toggle microphone", error);
      setDeviceError("Microphone access is unavailable. Check your browser permission or selected device.");
    } finally {
      setDeviceAction(undefined);
    }
  };

  const toggleCam = async () => {
    if (deviceAction) return;
    setDeviceAction("camera");
    setDeviceError(undefined);
    try {
      if (cameraIsOn) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
    } catch (error) {
      console.error("Unable to toggle camera", error);
      setDeviceError("Camera access is unavailable. Check your browser permission or selected device.");
    } finally {
      setDeviceAction(undefined);
    }
  };

  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);
    setJoinError(undefined);
    try {
      // A guest may need one click to be admitted and a second click to join
      // from the device preview. `canJoin` includes that local grant.
      if (requiresAdmission && !canJoin) {
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
      setJoinError("We could not complete that action. Check your connection and try again.");
      toast({ title: "Unable to join meeting", description: "Check your connection and try again." });
    } finally {
      setIsJoining(false);
    }
  };

  const cameraStatus = cameraState.hasBrowserPermission === false
    ? "Permission needed"
    : cameraState.optimisticStatus === "enabled"
    ? "Camera ready"
    : cameraState.optimisticStatus === "disabled"
    ? "Camera off"
    : "Checking camera";
  const microphoneStatus = microphoneState.hasBrowserPermission === false
    ? "Permission needed"
    : microphoneState.optimisticStatus === "enabled"
    ? "Microphone ready"
    : microphoneState.optimisticStatus === "disabled"
    ? "Microphone off"
    : "Checking microphone";

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
      <main className="prejoin-waiting flex min-h-dvh w-full flex-col bg-[#101216] px-4 py-5 text-[#E8EAED] sm:px-6 sm:py-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <BaithakLogo size={30} textClassName="text-lg" />
          <span className="hidden items-center gap-2 text-xs text-[#8B909A] sm:flex">
            <ShieldCheck className="size-4 text-[#8AB4F8]" />
            Private waiting room
          </span>
        </header>
        <div className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#181b22] p-6 text-center shadow-2xl shadow-black/30 sm:p-10" aria-live="polite">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#8AB4F8]/20 bg-[#8AB4F8]/10 text-[#AECBFA]">
              {isWaiting ? <Clock3 className="size-7" /> : <UsersRound className="size-7" />}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B909A]">Baithak waiting room</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#A5AAB3]">
              {isWaiting
                ? "Keep this page open. Your microphone and camera stay off until you’re admitted."
                : quickAccess
                ? "Continue to the camera and microphone preview before entering."
                : admissionStatus === "denied"
                ? "You can send another request if you think this was a mistake."
                : "Your microphone and camera stay off while the host reviews your request."}
            </p>
            {joinError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#F28B82]/25 bg-[#F28B82]/10 px-3 py-3 text-left text-xs leading-5 text-[#F6AEA8]" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}
            {!isWaiting && (
              <Button
                type="button"
                onClick={handleJoin}
                disabled={isJoining}
                className="mt-7 h-12 w-full rounded-xl bg-[#AECBFA] px-7 font-semibold text-[#101216] hover:bg-[#D2E3FC] disabled:opacity-60 sm:w-auto"
              >
                {isJoining ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {isJoining
                  ? "Sending request…"
                  : quickAccess
                  ? "Continue to preview"
                  : admissionStatus === "denied"
                  ? "Request again"
                  : "Ask to join"}
                {!isJoining && <ArrowRight className="size-4" />}
              </Button>
            )}
            <div className="mt-7 border-t border-white/[0.08] pt-5 text-xs text-[#747984]">
              <span className="text-[#8B909A]">Meeting code</span>
              <span className="ml-2 font-mono text-[#BEC2CB]">{meetingId}</span>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="prejoin-room min-h-dvh w-full bg-[#101216] text-[#E8EAED]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <BaithakLogo size={30} textClassName="text-lg" />
        <div className="flex items-center gap-2 text-xs text-[#8B909A]">
          <ShieldCheck className="size-4 text-[#8AB4F8]" />
          <span className="hidden sm:inline">Your devices stay private until you join</span>
          <span className="sm:hidden">Pre-join settings</span>
        </div>
      </header>

      <main className="prejoin-room__main mx-auto flex w-full max-w-6xl items-center px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)] lg:gap-8">
          <section aria-labelledby="prejoin-title" className="min-w-0">
            <div className="prejoin-room__preview-card overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[#181b22] p-2 shadow-2xl shadow-black/30 sm:p-3">
              <div className="prejoin-room__preview relative aspect-video overflow-hidden rounded-[1.35rem] border border-white/[0.06] bg-[#0d0f13]">
                <VideoPreview className="h-full w-full" />

                {cameraState.optimisticStatus === "disabled" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#14171d] text-[#A5AAB3]">
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#20242c] text-[#E8EAED]">
                      <VideoOff className="size-7" />
                    </div>
                    <span className="text-sm">Camera is off</span>
                  </div>
                )}

                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl border border-white/10 bg-[#101216]/95 p-2 shadow-xl sm:inset-x-1/2 sm:w-max sm:-translate-x-1/2 sm:justify-center sm:gap-2 sm:rounded-full sm:px-3">
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={!!deviceAction}
                    title={microphoneIsOn ? "Turn off microphone" : "Turn on microphone"}
                    aria-label={microphoneIsOn ? "Turn off microphone" : "Turn on microphone"}
                    aria-pressed={microphoneIsOn}
                    className={`flex h-11 flex-1 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-wait disabled:opacity-60 sm:w-11 sm:flex-none sm:rounded-full ${
                      microphoneIsOn
                        ? "bg-[#292e37] text-white hover:bg-[#363d49]"
                        : "bg-[#B3261E] text-white hover:bg-[#D33B30]"
                    }`}
                  >
                    {microphoneIsOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleCam}
                    disabled={!!deviceAction}
                    title={cameraIsOn ? "Turn off camera" : "Turn on camera"}
                    aria-label={cameraIsOn ? "Turn off camera" : "Turn on camera"}
                    aria-pressed={cameraIsOn}
                    className={`ml-2 flex h-11 flex-1 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-wait disabled:opacity-60 sm:ml-0 sm:w-11 sm:flex-none sm:rounded-full ${
                      cameraIsOn
                        ? "bg-[#292e37] text-white hover:bg-[#363d49]"
                        : "bg-[#B3261E] text-white hover:bg-[#D33B30]"
                    }`}
                  >
                    {cameraIsOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                  </button>
                  <div className="ml-2 flex h-11 w-11 items-center justify-center text-white sm:ml-0">
                    <DeviceSettings />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-xs text-[#8B909A] sm:px-1 sm:pt-4">
                <span>Check your camera, microphone, and speakers before entering.</span>
                <span className="hidden shrink-0 font-mono text-[#BEC2CB] sm:inline">{meetingId}</span>
              </div>
            </div>
          </section>

          <section className="prejoin-room__details-card min-w-0 rounded-[1.75rem] border border-white/[0.09] bg-[#181b22] p-5 shadow-2xl shadow-black/20 sm:p-7" aria-labelledby="prejoin-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B909A]">You’re almost in</p>
                <h1 id="prejoin-title" className="mt-3 text-3xl font-semibold tracking-tight text-[#F1F3F4]">Ready to join?</h1>
                <p className="mt-2 text-sm leading-6 text-[#A5AAB3]">Take a moment to check your setup, then enter when you’re ready.</p>
              </div>
              <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[#8AB4F8]/20 bg-[#8AB4F8]/10 text-[#AECBFA] sm:flex">
                <ShieldCheck className="size-5" />
              </div>
            </div>

            <div className="mt-6 space-y-2" aria-label="Device readiness">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#20242c] px-3.5 py-3">
                <span className="flex items-center gap-3 text-sm text-[#D8DCE3]">
                  <span className={`flex size-8 items-center justify-center rounded-lg ${cameraIsOn ? "bg-[#8AB4F8]/10 text-[#AECBFA]" : "bg-white/[0.06] text-[#A5AAB3]"}`}>
                    {cameraIsOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                  </span>
                  Camera
                </span>
                <span className={`text-xs ${cameraIsOn ? "text-[#AECBFA]" : cameraState.hasBrowserPermission === false ? "text-[#F6AEA8]" : "text-[#A5AAB3]"}`}>
                  {cameraStatus}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#20242c] px-3.5 py-3">
                <span className="flex items-center gap-3 text-sm text-[#D8DCE3]">
                  <span className={`flex size-8 items-center justify-center rounded-lg ${microphoneIsOn ? "bg-[#8AB4F8]/10 text-[#AECBFA]" : "bg-white/[0.06] text-[#A5AAB3]"}`}>
                    {microphoneIsOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                  </span>
                  Microphone
                </span>
                <span className={`text-xs ${microphoneIsOn ? "text-[#AECBFA]" : microphoneState.hasBrowserPermission === false ? "text-[#F6AEA8]" : "text-[#A5AAB3]"}`}>
                  {microphoneStatus}
                </span>
              </div>
            </div>

            {deviceError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F28B82]/25 bg-[#F28B82]/10 px-3 py-3 text-xs leading-5 text-[#F6AEA8]" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{deviceError}</span>
              </div>
            )}
            {joinError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F28B82]/25 bg-[#F28B82]/10 px-3 py-3 text-xs leading-5 text-[#F6AEA8]" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleJoin}
              disabled={isJoining}
              className="mt-6 h-12 w-full rounded-xl bg-[#AECBFA] text-base font-semibold text-[#101216] hover:bg-[#D2E3FC] disabled:opacity-60"
            >
              {isJoining ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {isJoining ? "Joining…" : "Join now"}
            </Button>

            <MeetingAdmissionControls />

            <div className="mt-6 border-t border-white/[0.08] pt-5 text-xs leading-5 text-[#8B909A]">
              <p>You can change these settings at any time during the meeting.</p>
              <p className="mt-1">Joining code: <span className="font-mono text-[#BEC2CB]">{meetingId}</span></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MeetingSetup;

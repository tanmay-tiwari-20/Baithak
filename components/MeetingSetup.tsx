"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Video, VideoOff, ShieldCheck, Share2 } from "lucide-react";
import BaithakLogo from "./BaithakLogo";

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
}

const MeetingSetup = ({ setIsSetupComplete }: MeetingSetupProps) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const call = useCall();
  if (!call) {
    throw new Error("useCall must be used within StreamCall component");
  }

  // Sync camera and mic with call hardware state
  useEffect(() => {
    if (!isCamOn) {
      call.camera.disable();
    } else {
      call.camera.enable();
    }
  }, [isCamOn, call]);

  useEffect(() => {
    if (!isMicOn) {
      call.microphone.disable();
    } else {
      call.microphone.enable();
    }
  }, [isMicOn, call]);

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleCam = () => setIsCamOn((prev) => !prev);

  const handleJoin = async () => {
    await call.join();
    setIsSetupComplete(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#202124] text-[#E8EAED] flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <BaithakLogo size={32} textClassName="text-xl font-normal" />
        <div className="flex items-center gap-2 text-xs text-[#9AA0A6]">
          <ShieldCheck className="w-4 h-4 text-[#8AB4F8]" />
          <span>Encrypted Call</span>
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
                No one else is here yet, or you&apos;re the first to arrive.
              </p>
            </div>

            {/* Action Buttons: Join now & Present */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handleJoin}
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#8AB4F8] hover:bg-[#AECBFA] text-[#202124] font-medium text-base transition-colors"
              >
                Join now
              </Button>

              <Button
                onClick={handleJoin}
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 rounded-full border border-[#5F6368] text-[#8AB4F8] hover:bg-[#303134] hover:text-[#AECBFA] font-medium text-sm flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Present</span>
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="pt-4 border-t border-[#3C4043] w-full text-xs text-[#9AA0A6] space-y-1">
              <p>Joining info will be available inside the call.</p>
              <p>You can turn off camera and mic at any time.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#5F6368]">
        Baithak Secure Video Calling • Privacy & Terms
      </footer>
    </div>
  );
};

export default MeetingSetup;

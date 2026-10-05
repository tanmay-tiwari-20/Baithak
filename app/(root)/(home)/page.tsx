"use client";

import React, { useState } from "react";
import MeetingTypeList from "@/components/MeetingTypeList";
import { Link as LinkIcon, Calendar, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

const carouselItems = [
  {
    icon: <LinkIcon className="w-10 h-10 text-[#8AB4F8]" />,
    title: "Get a link you can share",
    description:
      "Click New meeting to get a link you can send to people you want to meet with.",
  },
  {
    icon: <Calendar className="w-10 h-10 text-[#8AB4F8]" />,
    title: "Plan ahead",
    description:
      "Schedule meetings in advance and send invitations to all participants.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-[#8AB4F8]" />,
    title: "Share access with a code",
    description:
      "Send your meeting code or link to the people you want to join.",
  },
];

const Home = () => {
  const [slide, setSlide] = useState(0);

  const nextSlide = () => {
    setSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <section className="flex flex-col gap-12 text-[#E8EAED] max-w-7xl mx-auto py-4">
      {/* Google Meet Hero Split: Left Action Controls + Right Visual Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading + New Meeting & Code Controls */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#E8EAED] leading-tight">
              Video calls and meetings <br />
              <span className="text-[#8AB4F8]">for everyone</span>
            </h1>
            <p className="text-base sm:text-lg text-[#9AA0A6] max-w-xl font-normal leading-relaxed">
              Connect, collaborate, and celebrate from anywhere with Baithak. High quality video calls with zero friction.
            </p>
          </div>

          {/* Action Row & Workspace Cards */}
          <div className="pt-2">
            <MeetingTypeList />
          </div>

          <div className="pt-4 border-t border-[#3C4043] flex items-center gap-2 text-xs text-[#9AA0A6]">
            <span>Learn more about</span>
            <span className="text-[#8AB4F8]">
              Baithak Video Collaboration
            </span>
          </div>
        </div>

        {/* Right Column: Google Meet Style Feature Carousel */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
            {/* Circular Illustration Frame */}
            <div className="relative w-44 h-44 rounded-full bg-[#28292C] border border-[#3C4043] flex items-center justify-center transition-all duration-300">
              {carouselItems[slide].icon}
            </div>

            {/* Slide Text */}
            <div className="space-y-2 min-h-[90px]">
              <h2 className="text-xl font-medium text-[#E8EAED]">
                {carouselItems[slide].title}
              </h2>
              <p className="text-sm text-[#9AA0A6] leading-relaxed max-w-xs mx-auto">
                {carouselItems[slide].description}
              </p>
            </div>

            {/* Carousel Navigation: Dots + Arrows */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={prevSlide}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134] transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {carouselItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === slide ? "w-6 bg-[#8AB4F8]" : "w-2 bg-[#5F6368]"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134] transition-colors"
                title="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;

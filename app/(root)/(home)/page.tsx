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
    <section className="mx-auto flex max-w-7xl flex-col gap-8 py-2 text-[#E8EAED]">
      <div className="grid grid-cols-1 gap-8 border-b border-[#3C4043] pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#AECBFA]">
            Baithak workspace
          </p>
          <h1 className="max-w-2xl text-4xl font-medium leading-tight tracking-[-0.03em] text-[#E8EAED] sm:text-5xl">
            Video calls and meetings <span className="text-[#8AB4F8]">for everyone</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-[#9AA0A6] sm:text-lg">
            Start a room, schedule a conversation, or join with a meeting code.
          </p>
        </div>

        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#3C4043] bg-[#202124] p-6 sm:p-8">
          <div className="flex w-full max-w-sm flex-col items-center space-y-6 text-center">
            <div className="flex size-32 items-center justify-center rounded-full border border-[#3C4043] bg-[#28292C] sm:size-36">
              {carouselItems[slide].icon}
            </div>

            <div className="min-h-[92px] space-y-2">
              <h2 className="text-lg font-medium text-[#E8EAED] sm:text-xl">
                {carouselItems[slide].title}
              </h2>
              <p className="mx-auto max-w-xs text-sm leading-6 text-[#9AA0A6]">
                {carouselItems[slide].description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous workspace tip"
                className="flex size-9 items-center justify-center rounded-lg text-[#9AA0A6] transition-colors hover:bg-[#303134] hover:text-[#E8EAED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="flex items-center gap-2" aria-label="Workspace tips">
                {carouselItems.map((item, idx) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setSlide(idx)}
                    aria-label={`Show tip ${idx + 1}`}
                    aria-current={idx === slide ? "true" : undefined}
                    className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] ${
                      idx === slide ? "w-6 bg-[#8AB4F8]" : "w-2 bg-[#5F6368]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next workspace tip"
                className="flex size-9 items-center justify-center rounded-lg text-[#9AA0A6] transition-colors hover:bg-[#303134] hover:text-[#E8EAED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-1">
        <MeetingTypeList />
      </div>
    </section>
  );
};

export default Home;

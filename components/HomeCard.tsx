import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick: () => void;
}

const HomeCard = ({
  className,
  img,
  title,
  description,
  handleClick,
}: HomeCardProps) => {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-[220px] w-full cursor-pointer flex-col justify-between rounded-2xl border border-[#3C4043] bg-[#28292C] px-5 py-6 text-left transition-colors hover:border-[#5F6368] hover:bg-[#303134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] xl:max-w-[270px]",
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex size-11 items-center justify-center rounded-xl border border-[#3C4043] bg-[#202124]">
        <Image
          src={img}
          alt=""
          width={27}
          height={27}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-[#E8EAED]">{title}</h2>
        <p className="text-sm leading-6 text-[#9AA0A6]">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;

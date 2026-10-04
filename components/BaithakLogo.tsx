import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BaithakLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  href?: string;
}

export const BaithakLogo = ({
  size = 36,
  className,
  showText = true,
  textClassName,
  href = "/",
}: BaithakLogoProps) => {
  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/icons/logo.svg"
        alt="Baithak"
        width={size}
        height={size}
        className="shrink-0"
        priority
      />

      {showText && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[22px] font-medium tracking-tight text-[#E8EAED] hover:text-white transition-colors",
              textClassName
            )}
          >
            Baithak
          </span>
          <span className="text-sm font-normal text-[#9AA0A6]">
            Meet
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none rounded-md">
        {content}
      </Link>
    );
  }

  return content;
};

export default BaithakLogo;

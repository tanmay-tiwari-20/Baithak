"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-[480px] flex-col gap-6 overflow-y-auto rounded-2xl border border-[#3C4043] bg-[#28292C] px-4 py-6 text-[#E8EAED] shadow-2xl sm:w-[calc(100%-2rem)] sm:px-6 sm:py-8">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col gap-5">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt="status" width={64} height={64} />
            </div>
          )}
          <h2 className={cn("text-2xl font-normal text-[#E8EAED] tracking-tight", className)}>
            {title}
          </h2>
          
          {children}

          <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row sm:gap-3">
            <Button
              variant="ghost"
              className="w-full rounded-full text-[#9AA0A6] hover:bg-[#303134] hover:text-[#E8EAED] sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="w-full rounded-full bg-[#1A73E8] px-6 font-medium text-white hover:bg-[#1557B0] sm:w-auto"
              onClick={handleClick}
            >
              {buttonIcon && (
                <Image
                  src={buttonIcon}
                  alt="icon"
                  width={14}
                  height={14}
                  className="mr-2"
                />
              )}
              {buttonText || "Schedule Meeting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;

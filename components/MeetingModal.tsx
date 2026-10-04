"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
      <DialogContent className="flex w-full max-w-[480px] flex-col gap-6 border border-[#3C4043] bg-[#28292C] px-6 py-8 text-[#E8EAED] rounded-2xl shadow-2xl">
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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              className="rounded-full text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white px-6 font-medium"
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
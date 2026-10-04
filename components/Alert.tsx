import Link from "next/link";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title }: PermissionCardProps) => {
  return (
    <section className="flex items-center justify-center min-h-screen w-full bg-[#202124] p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-[#28292C] border border-[#3C4043] p-8 text-[#E8EAED] text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[#EA4335]/20 flex items-center justify-center mx-auto text-[#EA4335]">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-normal text-[#E8EAED]">{title}</h2>
          <p className="text-sm text-[#9AA0A6]">
            You may not have permission to join this meeting, or the link may be invalid.
          </p>
        </div>

        <Button
          asChild
          className="rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white px-8 h-11 text-sm font-medium"
        >
          <Link href="/">Return to Home screen</Link>
        </Button>
      </div>
    </section>
  );
};

export default Alert;
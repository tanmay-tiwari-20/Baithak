import React from "react";
import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] h-screen w-full bg-[#202124] text-[#E8EAED] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#8AB4F8]" />
      <p className="text-sm text-[#9AA0A6] font-normal">Loading Baithak...</p>
    </div>
  );
};

export default Loader;
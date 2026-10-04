import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="w-full flex justify-center">
      <SignUp />
    </div>
  );
};

export default SignUpPage;

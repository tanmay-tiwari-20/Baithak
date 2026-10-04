import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return (
    <div className="w-full flex justify-center">
      <SignIn />
    </div>
  );
};

export default SignInPage;

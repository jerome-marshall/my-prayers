import TabSwitcher from "@/components/TabSwitcher";
import React from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
// import GoogleOAuthButton from "@/components/GoogleOAuthButton";

const AuthenticatePage = async () => {
  const user = await getUser();
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <div className="relative flex h-screen w-full bg-background">
      <div className="absolute left-1/2 top-1/2 max-w-3xl -translate-x-1/2 -translate-y-1/2">
        {/* <GoogleOAuthButton /> */}
        <div className="h-4"></div>
        <TabSwitcher SignInTab={<SignInForm />} SignUpTab={<SignUpForm />} />
      </div>
    </div>
  );
};

export default AuthenticatePage;

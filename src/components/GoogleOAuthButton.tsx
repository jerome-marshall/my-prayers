"use client";
import React from "react";
import { Button } from "./ui/button";
import { RiGoogleFill } from "@remixicon/react";
// import { getGoogleOauthConsentUrl } from "@/app/authenticate/auth.action";
import { toast } from "sonner";
import { getGoogleOauthConsentUrl } from "@/app/authenticate/auth.action";

const GoogleOAuthButton = () => {
  return (
    <Button
      onClick={async () => {
        const res = await getGoogleOauthConsentUrl();
        if (res.url) {
          window.location.href = res.url;
        } else {
          toast.error(res.error);
        }
      }}
    >
      <RiGoogleFill className="mr-2 h-4 w-4" /> Continue with Google!
    </Button>
  );
};

export default GoogleOAuthButton;

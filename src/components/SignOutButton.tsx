"use client";
import { logOut } from "@/app/authenticate/auth.action";
import React from "react";
import { Button } from "./ui/button";

type Props = {
  children: React.ReactNode;
};

const SignOutButton = ({ children }: Props) => {
  return <Button onClick={() => logOut()}>{children}</Button>;
};

export default SignOutButton;

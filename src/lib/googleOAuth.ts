import { env } from "@/env";
import { Google } from "arctic";

export const googleOAuthClient = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.NEXT_PUBLIC_URL}/api/auth/google/callback`,
);

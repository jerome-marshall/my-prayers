import { googleOAuthClient } from "@/lib/googleOAuth";
import { lucia } from "@/lib/lucia";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    console.error("No code or state");
    return new Response("Invalid request", { status: 400 });
  }

  const codeVerifier = cookies().get("codeVerifier")?.value;
  const savedState = cookies().get("state")?.value;

  if (!codeVerifier || !savedState) {
    console.error("No code verifier or state");
    return new Response("Invalid request", { status: 400 });
  }

  if (state !== savedState) {
    console.error("State mismatch");
    return new Response("Invalid request", { status: 400 });
  }

  const { accessToken } = await googleOAuthClient.validateAuthorizationCode(
    code,
    codeVerifier,
  );

  const googleResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const GoogleUserSchema = z.object({
    sub: z.string(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
    picture: z.string(),
    email: z.string(),
    email_verified: z.boolean(),
  });

  const googleUser = GoogleUserSchema.parse(await googleResponse.json());

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, googleUser.email),
  });

  let userId: string | null = null;
  if (existingUser) {
    userId = existingUser.id;
  } else {
    const insertedUsers = await db
      .insert(users)
      .values({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        picture: googleUser.picture,
        role: "user",
      })
      .returning({
        id: users.id,
      });

    const user = insertedUsers[0];

    if (!user) {
      return new Response("Failed to create user", { status: 500 });
    }

    userId = user.id;
  }

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
}

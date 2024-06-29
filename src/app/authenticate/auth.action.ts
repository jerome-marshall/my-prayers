"use server";

import { lucia } from "@/lib/lucia";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";
import { type SignUpFormValues } from "./SignUpForm";
import { type SignInFormValues } from "./SignInForm";
import { redirect } from "next/navigation";

export const signUp = async (values: SignUpFormValues) => {
  try {
    const exsistingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, values.email),
    });
    if (exsistingUser) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await new Argon2id().hash(values.password);

    const insertedUsers = await db
      .insert(users)
      .values({
        name: values.name,
        hashedPassword,
        email: values.email.toLowerCase(),
        role: "user",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    const user = insertedUsers[0];

    if (!user) {
      return { success: false, error: "Failed to create user" };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
};

export const signIn = async (values: SignInFormValues) => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, values.email),
    });
    if (!user?.hashedPassword) {
      return { success: false, error: "Invalid credentials!" };
    }

    const passwordMatch = await new Argon2id().verify(
      user.hashedPassword,
      values.password,
    );
    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials!" };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { success: true, user: user };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
};

export const logOut = async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { success: false, error: "No session found" };
  }

  await lucia.invalidateSession(sessionId);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/authenticate");
};

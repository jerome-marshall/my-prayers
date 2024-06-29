import SignOutButton from "@/components/SignOutButton";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      test
      <SignOutButton>Sign Out</SignOutButton>
    </main>
  );
}

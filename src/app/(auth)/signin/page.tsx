import type { Metadata } from "next";
import { AuthPortal } from "@/components/auth/auth-portal";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <AuthPortal next={next} error={error} />;
}

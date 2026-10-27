import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}

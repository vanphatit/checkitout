import { Suspense } from "react";
import { EmailVerificationForm } from "@/components/forms";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationForm />
    </Suspense>
  );
}

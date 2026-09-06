import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import Loader from "@/components/Loader";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  // LoginForm reads `?next=`, so it needs a Suspense boundary.
  return (
    <Suspense fallback={<Loader label="Loading..." />}>
      <LoginForm />
    </Suspense>
  );
}

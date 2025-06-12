"use client";
import { AuthProvider } from "../contexts/AuthContext";
import SignUpForm from "../pages/signup";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AuthProvider>
        <SignUpForm />
      </AuthProvider>
    </main>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "../services/api.js";

function SignUpPage({ onSuccess, onNavigate, onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (result) => {
      onSuccess(result.user);
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    signUpMutation.mutate({
      username,
      email,
      password,
    });
  }

  const error =
    signUpMutation.error?.message || "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-8 text-sm text-neutral-600 hover:text-black"
        >
          ← Back to PayWise
        </button>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold text-neutral-500">
            PayWise
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Start keeping your payments organized.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="signup-username"
                className="mb-1.5 block text-sm font-medium"
              >
                Username
              </label>

              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                required
                maxLength={80}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm text-black"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={signUpMutation.isPending}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {signUpMutation.isPending
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("signin")}
              className="font-semibold text-black underline underline-offset-4"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default SignUpPage;
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "../services/api.js";

function SignInPage({ onSuccess, onNavigate, onBack }) {
  const [login, setlogin] = useState("");
  const [password, setPassword] = useState("");

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (result) => {
      onSuccess?.(result.user);
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    signInMutation.mutate({
      login,
      password,
    });
  }

  const error = signInMutation.error?.message || "";
  const loading = signInMutation.isPending;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-md">
        <button
          type="button"
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
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Sign in to continue to your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="signin-login"
                className="mb-1.5 block text-sm font-medium"
              >
                Username or email
              </label>

              <input
                id="signin-login"
                type="text"
                autoComplete="username"
                required
                value={login}
                onChange={(event) => setlogin(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Enter username or email"
              />
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Enter your password"
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
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            New to PayWise?{" "}
            <button
              type="button"
              onClick={() => onNavigate("signup")}
              className="font-semibold text-black underline underline-offset-4"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default SignInPage;

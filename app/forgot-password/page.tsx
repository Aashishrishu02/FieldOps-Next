"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to generate reset link");
        return;
      }

      setMessage(data.message);

      // Testing reset link
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#147a67] text-white flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              FieldOps
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Forgot your password?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your account email"
              required
              className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#147a67] focus:ring-1 focus:ring-[#147a67] transition-all"
            />
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="border border-green-200 bg-green-50 text-green-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm">
              {message}
            </div>
          )}

          {resetUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-800">
              <p className="font-semibold mb-1">Testing Reset Link:</p>
              <a
                href={resetUrl}
                className="text-[#147a67] underline break-all font-mono"
              >
                {resetUrl}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#147a67] hover:bg-[#106253] disabled:opacity-50 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            {loading ? "Generating..." : "Generate Reset Link"}
          </button>

          <Link
            href="/"
            className="block text-center w-full border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </main>
  );
}
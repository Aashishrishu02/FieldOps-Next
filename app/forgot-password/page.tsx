"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to generate reset link"
        );
        return;
      }

      setMessage(data.message);

      // Testing only
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            FieldOps
          </h1>

          <p className="text-gray-500 mt-2">
            Forgot your password?
          </p>
        </div>

        <form
          onSubmit={handleForgotPassword}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your account email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {resetUrl && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Testing Reset Link
              </p>

              <a
                href={resetUrl}
                className="text-blue-600 underline text-sm break-all"
              >
                Open Reset Password Page
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
          >
            {loading
              ? "Generating..."
              : "Generate Reset Link"}
          </button>

          <Link
            href="/"
            className="block text-center w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </main>
  );
}
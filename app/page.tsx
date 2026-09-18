"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      setSuccess("Login successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Login error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google";
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            FieldOps
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500">
              OR
            </span>
          </div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 bg-white text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
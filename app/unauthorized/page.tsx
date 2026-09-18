"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-7 text-center">

        <h1 className="text-2xl font-semibold text-gray-900">
          Access Denied
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          You do not have permission to access this page.
        </p>

        <div className="flex justify-center gap-3 mt-6">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Login
          </button>

        </div>
      </div>
    </main>
  );
}
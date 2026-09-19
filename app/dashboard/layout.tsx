"use client";

import { ReactNode } from "react";
import { UserProvider, useUser } from "./context/UserContext";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";

function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            Loading dashboard...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Checking your account access.
          </p>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard Error
          </h1>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}

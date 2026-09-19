"use client";

import { ReactNode } from "react";
import { UserProvider, useUser } from "./context/UserContext";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { FullDashboardLayoutSkeleton } from "./components/DashboardSkeleton";

function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, error } = useUser();

  if (loading) {
    return <FullDashboardLayoutSkeleton />;
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Dashboard Error
          </h1>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <MobileNav />
        <main className="flex-1 min-w-0 w-full">{children}</main>
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

"use client";

import Link from "next/link";
import { useUser } from "./context/UserContext";
import { Header } from "./components/Header";
import { navigationItems, permissionLabels } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const firstName = user.name?.trim().split(" ")[0] || "User";

  const visibleMenuItems = navigationItems.filter((item) => {
    if (!item.permission) {
      return true;
    }
    return user.permissions.includes(item.permission);
  });

  return (
    <section className="min-w-0">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}.`}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Current account and access information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-500">Role</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {user.role}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-500">Permissions</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {user.permissions.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-500">Available Modules</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              {Math.max(visibleMenuItems.length - 1, 0)}
            </p>
          </div>
        </div>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Quick Access
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Open the sections available to your account.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {visibleMenuItems
              .filter((item) => item.path !== "/dashboard")
              .map((item) => (
                <div
                  key={item.path}
                  className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Open {item.name.toLowerCase()}
                    </p>
                  </div>

                  <Link
                    href={item.path}
                    className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    Open →
                  </Link>
                </div>
              ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Permissions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Permissions assigned to your account.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="border border-gray-200 rounded-md px-3.5 py-2.5"
                >
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {permissionLabels[permission] || permission}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 break-all">
                    {permission}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Account Details
            </h3>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {user.name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-green-700 mt-0.5">Active</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
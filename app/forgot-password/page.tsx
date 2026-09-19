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

  const availableModules = visibleMenuItems.filter(
    (item) => item.path !== "/dashboard"
  );

  return (
    <section className="min-w-0">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}.`}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-1">Good to see you</p>

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Welcome, {firstName}
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Manage your FieldOps activities, attendance, visits and account
            access from one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Role</p>

            <p className="text-lg font-semibold text-gray-900 mt-2">
              {user.role}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Current account role
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Permissions</p>

            <p className="text-lg font-semibold text-gray-900 mt-2">
              {user.permissions.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Assigned permissions
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Modules</p>

            <p className="text-lg font-semibold text-gray-900 mt-2">
              {availableModules.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Available to you
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">Account Status</p>

            <p className="text-lg font-semibold text-gray-900 mt-2">
              Active
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Account is currently active
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Quick Access
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Open the modules available for your account.
            </p>
          </div>

          {availableModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {availableModules.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Open {item.name.toLowerCase()} and manage related
                        activities.
                      </p>
                    </div>

                    <span className="text-sm text-gray-400 group-hover:text-gray-700 transition">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-gray-500">
              No additional modules are available for your account.
            </div>
          )}
        </section>

        {/* Permissions */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Your Permissions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Access currently assigned to your account.
            </p>
          </div>

          <div className="p-5">
            {user.permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.permissions.map((permission) => (
                  <div
                    key={permission}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {permissionLabels[permission] || permission}
                    </p>

                    <p className="text-xs text-gray-400 mt-1 break-all">
                      {permission}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No permissions assigned.
              </p>
            )}
          </div>
        </section>

        {/* Account Details */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Account Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>

              <p className="text-sm font-medium text-gray-900 mt-1">
                {user.name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>

              <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Role</p>

              <p className="text-sm font-medium text-gray-900 mt-1">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Status</p>

              <p className="text-sm font-medium text-gray-900 mt-1">
                Active
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
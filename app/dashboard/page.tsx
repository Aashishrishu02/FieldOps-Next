"use client";

import Link from "next/link";
import { useUser } from "./context/UserContext";
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
      <header className="bg-white border-b border-gray-200">
        <div className="px-5 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {firstName}.
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </header>

      <div className="px-5 sm:px-8 py-7">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Current account and access information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {user.role}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-sm text-gray-500">Permissions</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {user.permissions.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-sm text-gray-500">Available Modules</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {Math.max(visibleMenuItems.length - 1, 0)}
            </p>
          </div>
        </div>

        <section className="bg-white border border-gray-200 rounded-lg mb-7">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Quick Access
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Open the sections available to your account.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {visibleMenuItems
              .filter((item) => item.path !== "/dashboard")
              .map((item) => (
                <div
                  key={item.path}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Open {item.name.toLowerCase()}
                    </p>
                  </div>

                  <Link
                    href={item.path}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Open
                  </Link>
                </div>
              ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Permissions
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Permissions assigned to your account.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="border border-gray-200 rounded-md px-4 py-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {permissionLabels[permission] || permission}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    {permission}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg mt-7">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Account Details
            </h3>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-500">Name</p>
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
              <p className="text-sm font-medium text-green-700 mt-1">Active</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
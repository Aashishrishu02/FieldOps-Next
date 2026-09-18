"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string[];
};

type MenuItem = {
  name: string;
  path: string;
  permission?: string;
};

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Attendance",
    path: "/dashboard/attendance",
    permission: "READ_SELF_ATTENDANCE",
  },
  {
    name: "Visits",
    path: "/dashboard/visits",
    permission: "READ_SELF_VISIT",
  },
  {
    name: "Role Management",
    path: "/dashboard/roles",
    permission: "MANAGE_ROLES",
  },
  {
    name: "User Management",
    path: "/dashboard/users",
    permission: "MANAGE_USER_ACCOUNTS",
  },
];

const permissionLabels: Record<string, string> = {
  READ_SELF_ATTENDANCE: "View Own Attendance",
  READ_ALL_ATTENDANCE: "View All Attendance",
  CLOCK_IN_OUT: "Clock In / Out",
  READ_SELF_VISIT: "View Own Visits",
  READ_ALL_VISIT: "View All Visits",
  SAVE_VISIT: "Save Visits",
  MANAGE_ROLES: "Manage Roles",
  PROVISION_USERS: "Provision Users",
  MANAGE_USER_ACCOUNTS: "Manage User Accounts",
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/");
          return;
        }

        const data = await response.json();

        if (!data.user) {
          router.push("/");
          return;
        }

        if (active) {
          setUser(data.user);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load user:", error);

        if (active) {
          setLoading(false);
        }

        router.push("/");
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.name?.split(" ")[0] || "User";

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.permission) {
      return true;
    }

    return user.permissions.includes(item.permission);
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200">
          <div className="px-5 py-5 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">
              FieldOps
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Field operations system
            </p>
          </div>

          <nav className="flex-1 px-3 py-5">
            <p className="px-3 mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              Menu
            </p>

            <div className="space-y-1">
              {visibleMenuItems.map((item) => {
                const isActive = item.path === "/dashboard";

                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || "User"}
            </p>

            <p className="text-xs text-gray-500 truncate mt-1">
              {user.email}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {user.role}
            </p>

            <button
              onClick={handleLogout}
              className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 min-w-0">

          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="px-5 sm:px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Dashboard
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {firstName}.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="md:hidden text-sm text-gray-600"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="px-5 sm:px-8 py-7">

            {/* Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Overview
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current account and access information.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-500">
                  Role
                </p>

                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {user.role}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-500">
                  Permissions
                </p>

                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {user.permissions.length}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-500">
                  Available Modules
                </p>

                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {Math.max(visibleMenuItems.length - 1, 0)}
                </p>
              </div>

            </div>

            {/* Quick Access */}
            <div className="bg-white border border-gray-200 rounded-lg mb-7">

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

                      <button
                        onClick={() => router.push(item.path)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Open
                      </button>
                    </div>
                  ))}

                {visibleMenuItems.filter(
                  (item) => item.path !== "/dashboard"
                ).length === 0 && (
                  <div className="px-5 py-6">
                    <p className="text-sm text-gray-500">
                      No additional modules are available.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white border border-gray-200 rounded-lg">

              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Permissions
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Permissions assigned to your account.
                </p>
              </div>

              <div className="p-5">
                {user.permissions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No permissions assigned.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="border border-gray-200 rounded-md px-4 py-3"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {permissionLabels[permission] || permission}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {permission}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
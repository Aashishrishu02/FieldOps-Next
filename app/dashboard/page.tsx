"use client";

import Link from "next/link";
import { useUser } from "./context/UserContext";
import { Header } from "./components/Header";
import { navigationItems, permissionLabels } from "@/lib/types";

const moduleMetadata: Record<
  string,
  {
    description: string;
    icon: (className: string) => React.ReactNode;
  }
> = {
  "/dashboard/attendance": {
    description:
      "Clock in/out, monitor working hours, and review attendance logs.",
    icon: (className) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  "/dashboard/visits": {
    description:
      "Log customer visits, record site locations, and track outcomes.",
    icon: (className) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  "/dashboard/roles": {
    description:
      "Configure role permissions and maintain access control policies.",
    icon: (className) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  "/dashboard/users": {
    description:
      "Provision field accounts, assign system roles, and generate logins.",
    icon: (className) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
};

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

  const quickAccessModules = visibleMenuItems.filter(
    (item) => item.path !== "/dashboard"
  );

  return (
    <section className="min-w-0">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}.`}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor your field operations, assigned permissions, and system access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#147a67] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2 truncate">
              {user.role}
            </p>
            <p className="text-xs text-gray-400 mt-1">Assigned account role</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#147a67] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">
              {user.permissions.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Granted access keys</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Modules
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#147a67] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">
              {Math.max(visibleMenuItems.length - 1, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active operations tools</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#147a67] flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <p className="text-lg sm:text-xl font-bold text-[#147a67]">Active</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Verified and enabled</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Quick Access
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Navigate directly to permitted field operation modules.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              {quickAccessModules.length} modules available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {quickAccessModules.map((item) => {
              const meta = moduleMetadata[item.path];
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm hover:border-[#147a67]/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#147a67] flex items-center justify-center group-hover:bg-[#147a67] group-hover:text-white transition-colors">
                        {meta?.icon("w-5 h-5")}
                      </div>
                      <span className="text-gray-400 group-hover:text-[#147a67] group-hover:translate-x-0.5 transition-all text-sm font-medium">
                        →
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mt-4 group-hover:text-[#147a67] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                      {meta?.description ||
                        `Open and manage ${item.name.toLowerCase()}.`}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-[#147a67]">
                    <span>Open section</span>
                    <span className="text-gray-400 group-hover:text-[#147a67] transition-colors">
                      Launch
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Assigned Permissions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Specific capability keys granted to your current role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.permissions.map((permission) => (
              <div
                key={permission}
                className="bg-white border border-gray-200/80 rounded-lg p-3.5 flex items-start gap-3 shadow-xs hover:border-gray-300 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-[#147a67] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {permissionLabels[permission] || permission}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                    {permission}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Account Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current profile attributes and authentication status.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-[#147a67] border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#147a67]" />
              Verified Account
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="pb-3 sm:pb-0 border-b sm:border-b-0 border-gray-100">
              <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
                Full Name
              </span>
              <span className="text-sm font-medium text-gray-900 mt-1 block">
                {user.name || "Not provided"}
              </span>
            </div>

            <div className="pb-3 sm:pb-0 border-b sm:border-b-0 border-gray-100">
              <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
                Email Address
              </span>
              <span className="text-sm font-medium text-gray-900 mt-1 block break-all font-mono text-xs sm:text-sm">
                {user.email}
              </span>
            </div>

            <div className="pb-3 sm:pb-0 border-b sm:border-b-0 border-gray-100">
              <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
                Role
              </span>
              <span className="text-sm font-medium text-gray-900 mt-1 block">
                {user.role}
              </span>
            </div>

            <div>
              <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
                Status
              </span>
              <span className="text-sm font-medium text-[#147a67] mt-1 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#147a67]" />
                Active
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
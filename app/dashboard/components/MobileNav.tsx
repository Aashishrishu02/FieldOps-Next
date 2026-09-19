"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";
import { navigationItems } from "@/lib/types";

const navIcons: Record<string, (className: string) => React.ReactNode> = {
  "/dashboard": (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  "/dashboard/attendance": (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "/dashboard/visits": (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  "/dashboard/roles": (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  "/dashboard/users": (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useUser();

  if (!user) {
    return null;
  }

  const visibleItems = navigationItems.filter((item) => {
    if (!item.permission) {
      return true;
    }
    return user.permissions.includes(item.permission);
  });

  return (
    <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 text-base font-semibold text-gray-900 tracking-tight"
        >
          <div className="w-6 h-6 rounded bg-[#147a67] text-white flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span>FieldOps</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="p-1.5 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 px-4 pt-3 pb-5 bg-white space-y-3 shadow-md max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const active = item.exact
                ? pathname === item.path
                : pathname.startsWith(item.path);

              const renderIcon = navIcons[item.path];

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-emerald-50 text-[#147a67] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {renderIcon &&
                    renderIcon(
                      `w-4 h-4 shrink-0 ${
                        active ? "text-[#147a67]" : "text-gray-400"
                      }`
                    )}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-gray-200">
            <div className="px-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {user.email}
              </p>
              <p className="text-xs text-[#147a67] font-medium mt-0.5">
                {user.role}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                void logout();
              }}
              className="w-full mt-3 border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

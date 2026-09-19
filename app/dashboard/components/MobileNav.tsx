"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";
import { navigationItems } from "@/lib/types";

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
      <div className="flex items-center justify-between px-4 h-16">
        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
          className="text-lg font-semibold text-gray-900"
        >
          FieldOps
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-2 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
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
        <div className="border-t border-gray-200 px-4 pt-3 pb-5 bg-white space-y-3 shadow-md">
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const active = item.exact
                ? pathname === item.path
                : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-gray-200">
            <div className="px-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                void logout();
              }}
              className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

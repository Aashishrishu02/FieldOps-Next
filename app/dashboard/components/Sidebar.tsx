"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";
import { navigationItems } from "@/lib/types";

export function Sidebar() {
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
    <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 shrink-0">
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="block">
          <h1 className="text-xl font-semibold text-gray-900">FieldOps</h1>
          <p className="text-xs text-gray-500 mt-1">Field operations system</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const active = item.exact
              ? pathname === item.path
              : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
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
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name || "User"}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
        <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>

        <button
          type="button"
          onClick={logout}
          className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

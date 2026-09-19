"use client";

import Link from "next/link";
import { useUser } from "../context/UserContext";

type HeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export function Header({ title, subtitle, backHref }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-h-[3.75rem]">
        <div className="flex items-center gap-2.5 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 shrink-0 py-1 px-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              ← Dashboard
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {user && (
          <div className="text-left sm:text-right shrink-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[200px]">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
        )}
      </div>
    </header>
  );
}

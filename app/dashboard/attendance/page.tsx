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

type AttendanceRecord = {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  user?: {
    name: string | null;
    email: string;
  };
};

export default function AttendancePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Live timer
  const [currentTime, setCurrentTime] = useState(0);

  // ==========================================
  // Load user and attendance records
  // ==========================================
  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!userResponse.ok) {
          router.push("/");
          return;
        }

        const userData = await userResponse.json();

        if (!userData.user) {
          router.push("/");
          return;
        }

        const attendanceResponse = await fetch(
          "/api/attendance",
          {
            credentials: "include",
          }
        );

        const attendanceData =
          await attendanceResponse.json();

        if (!attendanceResponse.ok) {
          if (active) {
            setUser(userData.user);

            setError(
              attendanceData.message ||
                "Failed to load attendance."
            );

            setLoading(false);
          }

          return;
        }

        if (active) {
          setUser(userData.user);

          setRecords(
            attendanceData.attendance ||
              attendanceData.records ||
              []
          );

          setCurrentTime(Date.now());
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Attendance loading error:",
          error
        );

        if (active) {
          setError(
            "Something went wrong while loading attendance."
          );

          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [router]);

  // ==========================================
  // Live duration timer
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ==========================================
  // Refresh attendance records
  // ==========================================
  async function refreshAttendance() {
    try {
      const response = await fetch(
        "/api/attendance",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to refresh attendance."
        );

        return;
      }

      setRecords(
        data.attendance ||
          data.records ||
          []
      );

      setCurrentTime(Date.now());
    } catch (error) {
      console.error(
        "Attendance refresh error:",
        error
      );

      setError(
        "Something went wrong while refreshing attendance."
      );
    }
  }

  // ==========================================
  // Clock In
  // ==========================================
  async function handleClockIn() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/attendance/clock-in",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Clock in failed."
        );

        return;
      }

      setMessage("Clock in successful.");

      await refreshAttendance();
    } catch (error) {
      console.error(
        "Clock in error:",
        error
      );

      setError(
        "Something went wrong while clocking in."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // Clock Out
  // ==========================================
  async function handleClockOut() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/attendance/clock-out",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Clock out failed."
        );

        return;
      }

      setMessage("Clock out successful.");

      await refreshAttendance();
    } catch (error) {
      console.error(
        "Clock out error:",
        error
      );

      setError(
        "Something went wrong while clocking out."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // Logout
  // ==========================================
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      router.push("/");
    }
  }

  // ==========================================
  // Format date
  // ==========================================
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==========================================
  // Format date and time
  // ==========================================
  function formatDateTime(
    date: string | null
  ) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  }

  // ==========================================
  // Calculate duration
  // ==========================================
  function getDuration(
    clockIn: string,
    clockOut: string | null
  ) {
    const start =
      new Date(clockIn).getTime();

    const end = clockOut
      ? new Date(clockOut).getTime()
      : currentTime;

    const difference = Math.max(
      0,
      end - start
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
      (difference % (1000 * 60)) /
        1000
    );

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Loading attendance...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  // ==========================================
  // Permissions
  // ==========================================
  const canClockInOut =
    user.permissions.includes(
      "CLOCK_IN_OUT"
    );

  const canReadSelf =
    user.permissions.includes(
      "READ_SELF_ATTENDANCE"
    );

  const canReadAll =
    user.permissions.includes(
      "READ_ALL_ATTENDANCE"
    );

  const hasAttendanceAccess =
    canReadSelf || canReadAll;

  const hasOpenAttendance =
    records.some(
      (record) =>
        record.userId === user.id &&
        !record.clockOut
    );

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="flex min-h-screen">

        {/* =====================================
            SIDEBAR
        ====================================== */}
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

            <div className="space-y-1">

              {/* Dashboard */}
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </button>

              {/* Attendance */}
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
              >
                Attendance
              </button>

              {/* Visits */}
              {(user.permissions.includes(
                "READ_SELF_VISIT"
              ) ||
                user.permissions.includes(
                  "READ_ALL_VISIT"
                )) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/visits"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Visits
                </button>
              )}

              {/* Role Management */}
              {user.permissions.includes(
                "MANAGE_ROLES"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/roles"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Role Management
                </button>
              )}

              {/* User Management */}
              {user.permissions.includes(
                "MANAGE_USER_ACCOUNTS"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/users"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  User Management
                </button>
              )}

            </div>

          </nav>

          {/* User */}
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
              type="button"
              onClick={handleLogout}
              className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>

          </div>

        </aside>

        {/* =====================================
            MAIN
        ====================================== */}
        <section className="flex-1 min-w-0">

          {/* Header */}
          <header className="bg-white border-b border-gray-200">

            <div className="px-5 sm:px-8 py-5 flex items-start gap-4">

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="mt-1 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                ← Dashboard
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Attendance
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Manage attendance and view attendance records.
                </p>
              </div>

            </div>

          </header>

          {/* Content */}
          <div className="px-5 sm:px-8 py-7">

            {/* Error */}
            {error && (
              <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-5 border border-green-200 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
                {message}
              </div>
            )}

            {/* =================================
                ATTENDANCE ACTIONS
            ================================== */}
            <section className="bg-white border border-gray-200 rounded-lg mb-6">

              <div className="px-5 py-4 border-b border-gray-200">

                <h3 className="text-base font-semibold text-gray-900">
                  Attendance Actions
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Record your current attendance status.
                </p>

              </div>

              <div className="p-5">

                {canClockInOut ? (
                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={handleClockIn}
                      disabled={
                        actionLoading ||
                        hasOpenAttendance
                      }
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Clock In"}
                    </button>

                    <button
                      type="button"
                      onClick={handleClockOut}
                      disabled={
                        actionLoading ||
                        !hasOpenAttendance
                      }
                      className="px-4 py-2.5 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Clock Out"}
                    </button>

                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    You do not have permission to clock in or clock out.
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">

                  <span className="text-sm text-gray-600">
                    Current Status:{" "}
                  </span>

                  <span className="text-sm font-medium text-gray-900">
                    {hasOpenAttendance
                      ? "Clocked In"
                      : "Not Clocked In"}
                  </span>

                </div>

              </div>

            </section>

            {/* =================================
                ATTENDANCE RECORDS
            ================================== */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">

                <h3 className="text-base font-semibold text-gray-900">
                  Attendance Records
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {canReadAll
                    ? "Attendance records for all users."
                    : canReadSelf
                    ? "Your attendance records."
                    : "You do not have permission to view attendance records."}
                </p>

              </div>

              {hasAttendanceAccess ? (
                records.length === 0 ? (
                  <div className="px-5 py-8">

                    <p className="text-sm font-medium text-gray-700">
                      No attendance records found.
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Your attendance records will appear here.
                    </p>

                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="min-w-full">

                      <thead className="bg-gray-50 border-b border-gray-200">

                        <tr>

                          {canReadAll && (
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                              User
                            </th>
                          )}

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Date
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Clock In
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Clock Out
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Duration
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        {records.map(
                          (record) => (
                            <tr
                              key={record.id}
                              className="hover:bg-gray-50"
                            >

                              {/* User */}
                              {canReadAll && (
                                <td className="px-5 py-4">

                                  <p className="text-sm font-medium text-gray-900">
                                    {record.user?.name ||
                                      "Unknown User"}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {record.user?.email ||
                                      "-"}
                                  </p>

                                </td>
                              )}

                              {/* Date */}
                              <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {formatDate(
                                  record.clockIn
                                )}
                              </td>

                              {/* Clock In */}
                              <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {formatDateTime(
                                  record.clockIn
                                )}
                              </td>

                              {/* Clock Out */}
                              <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {formatDateTime(
                                  record.clockOut
                                )}
                              </td>

                              {/* Duration */}
                              <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {getDuration(
                                  record.clockIn,
                                  record.clockOut
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-5 py-4 text-sm font-medium whitespace-nowrap">

                                {record.clockOut ? (
                                  <span className="text-green-700">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-blue-700">
                                    In Progress
                                  </span>
                                )}

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )
              ) : (
                <div className="px-5 py-8">

                  <p className="text-sm font-medium text-gray-900">
                    Access denied.
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    You do not have permission to view attendance records.
                  </p>

                </div>
              )}

            </section>

          </div>
        </section>
      </div>
    </main>
  );
}
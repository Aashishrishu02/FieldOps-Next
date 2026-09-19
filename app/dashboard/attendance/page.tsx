"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { Header } from "../components/Header";
import { formatDate, formatDateTime, getDuration } from "@/lib/utils";

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
  const { user } = useUser();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch("/api/attendance", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load attendance.");
        return;
      }

      setRecords(data.attendance || data.records || []);
      setCurrentTime(Date.now());
    } catch (err) {
      console.error("Attendance loading error:", err);
      setError("Something went wrong while loading attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  // Live duration timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function handleClockIn() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/attendance/clock-in", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Clock in failed.");
        return;
      }

      setMessage("Clock in successful.");
      await fetchAttendance();
    } catch (err) {
      console.error("Clock in error:", err);
      setError("Something went wrong while clocking in.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClockOut() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/attendance/clock-out", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Clock out failed.");
        return;
      }

      setMessage("Clock out successful.");
      await fetchAttendance();
    } catch (err) {
      console.error("Clock out error:", err);
      setError("Something went wrong while clocking out.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-600">
        Loading attendance...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canClockInOut = user.permissions.includes("CLOCK_IN_OUT");
  const canReadSelf = user.permissions.includes("READ_SELF_ATTENDANCE");
  const canReadAll = user.permissions.includes("READ_ALL_ATTENDANCE");
  const hasAttendanceAccess = canReadSelf || canReadAll;

  const hasOpenAttendance = records.some(
    (record) => record.userId === user.id && !record.clockOut
  );

  return (
    <section className="min-w-0">
      <Header
        title="Attendance"
        subtitle="Manage attendance and view attendance records."
        backHref="/dashboard"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="border border-green-200 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-xs sm:text-sm">
            {message}
          </div>
        )}

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">
              Attendance Actions
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Record your current attendance status.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            {canClockInOut ? (
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleClockIn}
                  disabled={actionLoading || hasOpenAttendance}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? "Processing..." : "Clock In"}
                </button>

                <button
                  type="button"
                  onClick={handleClockOut}
                  disabled={actionLoading || !hasOpenAttendance}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? "Processing..." : "Clock Out"}
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600">
                You do not have permission to clock in or clock out.
              </p>
            )}

            <div className="mt-3.5 pt-3.5 border-t border-gray-100 flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Current Status:
              </span>
              <span
                className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded ${
                  hasOpenAttendance
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {hasOpenAttendance ? "Clocked In" : "Not Clocked In"}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">
              Attendance Records
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {canReadAll
                ? "Attendance records for all users."
                : canReadSelf
                ? "Your attendance records."
                : "You do not have permission to view attendance records."}
            </p>
          </div>

          {hasAttendanceAccess ? (
            records.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No attendance records found.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Your attendance records will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[600px] text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {canReadAll && (
                        <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                          User
                        </th>
                      )}
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        Clock In
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        Clock Out
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        Duration
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        {canReadAll && (
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {record.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.user?.email || "-"}
                            </p>
                          </td>
                        )}

                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                          {formatDate(record.clockIn)}
                        </td>

                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {formatDateTime(record.clockIn)}
                        </td>

                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {formatDateTime(record.clockOut)}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {getDuration(
                            record.clockIn,
                            record.clockOut,
                            currentTime
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.clockOut ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                              In Progress
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-gray-900">
                Access denied.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You do not have permission to view attendance records.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
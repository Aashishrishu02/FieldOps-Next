"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string[];
};

type VisitRecord = {
  id: string;
  userId: string;
  customerName: string;
  purpose: string;
  outcome: string;
  location: string;
  visitDate: string;
  user?: {
    name: string | null;
    email: string;
  };
};

export default function VisitsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [outcome, setOutcome] = useState("");
  const [location, setLocation] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        const userResponse = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          router.push("/");
          return;
        }

        const userData = await userResponse.json();

        if (!userData.user) {
          router.push("/");
          return;
        }

        const visitResponse = await fetch(
          "/api/visits",
          {
            credentials: "include",
          }
        );

        const visitData = await visitResponse.json();

        if (!visitResponse.ok) {
          if (active) {
            setError(
              visitData.message ||
                "Failed to load visits."
            );
            setUser(userData.user);
            setLoading(false);
          }

          return;
        }

        if (active) {
          setUser(userData.user);
          setVisits(
            visitData.visits ||
              visitData.records ||
              []
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Visits loading error:", error);

        if (active) {
          setError(
            "Something went wrong while loading visits."
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

  async function loadVisits() {
    try {
      const response = await fetch("/api/visits", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setVisits(
          data.visits ||
            data.records ||
            []
        );
      }
    } catch (error) {
      console.error("Visit refresh error:", error);
    }
  }

  async function handleSaveVisit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/visits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            customerName: customerName.trim(),
            purpose: purpose.trim(),
            outcome: outcome.trim(),
            location: location.trim(),
            visitDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to save visit."
        );
        return;
      }

      setMessage("Visit saved successfully.");

      setCustomerName("");
      setPurpose("");
      setOutcome("");
      setLocation("");
      setVisitDate("");

      await loadVisits();
    } catch (error) {
      console.error("Save visit error:", error);

      setError(
        "Something went wrong while saving the visit."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/");
    }
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Loading visits...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const canSave = user.permissions.includes(
    "SAVE_VISIT"
  );

  const canReadSelf = user.permissions.includes(
    "READ_SELF_VISIT"
  );

  const canReadAll = user.permissions.includes(
    "READ_ALL_VISIT"
  );

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
            <div className="space-y-1">

              <button
                onClick={() =>
                  router.push("/dashboard")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </button>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/attendance"
                  )
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Attendance
              </button>

              <button
                className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
              >
                Visits
              </button>

              {user.permissions.includes(
                "MANAGE_ROLES"
              ) && (
                <button
                  onClick={() =>
                    router.push("/dashboard/roles")
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Role Management
                </button>
              )}

              {user.permissions.includes(
                "MANAGE_USER_ACCOUNTS"
              ) && (
                <button
                  onClick={() =>
                    router.push("/dashboard/users")
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  User Management
                </button>
              )}

            </div>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || "User"}
            </p>

            <p className="text-xs text-gray-500 truncate mt-1">
              {user.email}
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
        <section className="flex-1">

          <header className="bg-white border-b border-gray-200">
            <div className="px-5 sm:px-8 py-5 flex items-start gap-4">

              <button
                onClick={() =>
                  router.push("/dashboard")
                }
                className="mt-1 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                ← Dashboard
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Visits
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Create and view field visit records.
                </p>
              </div>

            </div>
          </header>

          <div className="px-5 sm:px-8 py-7">

            {error && (
              <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 border border-green-200 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
                {message}
              </div>
            )}

            {/* Save Visit */}
            {canSave && (
              <section className="bg-white border border-gray-200 rounded-lg mb-6">

                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    Save Visit
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Add details about the customer visit.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveVisit}
                  className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Customer / Shop Name
                    </label>

                    <input
                      id="customerName"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter customer or shop name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="purpose"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Purpose
                    </label>

                    <input
                      id="purpose"
                      value={purpose}
                      onChange={(e) =>
                        setPurpose(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter visit purpose"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="outcome"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Outcome
                    </label>

                    <input
                      id="outcome"
                      value={outcome}
                      onChange={(e) =>
                        setOutcome(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter visit outcome"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Location / Address
                    </label>

                    <input
                      id="location"
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="visitDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Visit Date / Time
                    </label>

                    <input
                      id="visitDate"
                      type="datetime-local"
                      value={visitDate}
                      onChange={(e) =>
                        setVisitDate(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Visit"}
                    </button>
                  </div>

                </form>
              </section>
            )}

            {/* Visit Records */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Visit Records
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {canReadAll
                    ? "Visit records for all users."
                    : canReadSelf
                    ? "Your visit records."
                    : "You do not have permission to view visits."}
                </p>
              </div>

              {canReadSelf || canReadAll ? (
                visits.length === 0 ? (
                  <div className="px-5 py-8">
                    <p className="text-sm text-gray-600">
                      No visit records found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="min-w-full">

                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>

                          {canReadAll && (
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                              User
                            </th>
                          )}

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                            Customer
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                            Purpose
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                            Outcome
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                            Location
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                            Visit Date
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        {visits.map((visit) => (
                          <tr
                            key={visit.id}
                            className="hover:bg-gray-50"
                          >

                            {canReadAll && (
                              <td className="px-5 py-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {visit.user?.name ||
                                    "Unknown User"}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {visit.user?.email ||
                                    "-"}
                                </p>
                              </td>
                            )}

                            <td className="px-5 py-4 text-sm font-medium text-gray-900">
                              {visit.customerName}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.purpose}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.outcome}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.location}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {formatDateTime(
                                visit.visitDate
                              )}
                            </td>

                          </tr>
                        ))}

                      </tbody>
                    </table>

                  </div>
                )
              ) : (
                <div className="px-5 py-8">
                  <p className="text-sm text-gray-600">
                    Access denied.
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
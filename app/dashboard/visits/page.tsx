"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
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

  const [user, setUser] = useState<UserData | null>(
    null
  );

  const [visits, setVisits] = useState<VisitRecord[]>(
    []
  );

  const [customerName, setCustomerName] =
    useState("");

  const [purpose, setPurpose] = useState("");

  const [outcome, setOutcome] = useState("");

  const [location, setLocation] = useState("");

  const [visitDate, setVisitDate] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // ==========================================
  // Load page
  // ==========================================
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

        const userData =
          await userResponse.json();

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

        const visitData =
          await visitResponse.json();

        if (!visitResponse.ok) {
          if (active) {
            setUser(userData.user);

            setError(
              visitData.message ||
                "Failed to load visits."
            );

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
        console.error(
          "Visits loading error:",
          error
        );

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

  // ==========================================
  // Refresh visits
  // ==========================================
  async function refreshVisits() {
    try {
      const response = await fetch(
        "/api/visits",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to refresh visits."
        );

        return;
      }

      setVisits(
        data.visits ||
          data.records ||
          []
      );
    } catch (error) {
      console.error(
        "Visit refresh error:",
        error
      );

      setError(
        "Something went wrong while refreshing visits."
      );
    }
  }

  // ==========================================
  // Save visit
  // ==========================================
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
            customerName:
              customerName.trim(),

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
          data.message ||
            "Failed to save visit."
        );

        return;
      }

      setMessage(
        "Visit saved successfully."
      );

      setCustomerName("");
      setPurpose("");
      setOutcome("");
      setLocation("");
      setVisitDate("");

      await refreshVisits();
    } catch (error) {
      console.error(
        "Save visit error:",
        error
      );

      setError(
        "Something went wrong while saving the visit."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Logout
  // ==========================================
  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
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
  function formatDateTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ==========================================
  // Loading
  // ==========================================
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

  // ==========================================
  // Permissions
  // ==========================================
  const canSave =
    user.permissions.includes(
      "SAVE_VISIT"
    );

  const canReadSelf =
    user.permissions.includes(
      "READ_SELF_VISIT"
    );

  const canReadAll =
    user.permissions.includes(
      "READ_ALL_VISIT"
    );

  const hasVisitAccess =
    canReadSelf || canReadAll;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">

        {/* =====================================
            SIDEBAR
        ====================================== */}
        <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200">

          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">
              FieldOps
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Field operations system
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">

            <div className="space-y-1">

              {/* Dashboard */}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard"
                  )
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </button>

              {/* Attendance */}
              {(user.permissions.includes(
                "READ_SELF_ATTENDANCE"
              ) ||
                user.permissions.includes(
                  "READ_ALL_ATTENDANCE"
                )) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/attendance"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Attendance
                </button>
              )}

              {/* Visits */}
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
              >
                Visits
              </button>

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
            MAIN CONTENT
        ====================================== */}
        <section className="flex-1 min-w-0">

          {/* Header */}
          <header className="bg-white border-b border-gray-200">

            <div className="px-5 sm:px-8 py-5 flex items-start gap-4">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard"
                  )
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

            {/* Messages */}
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

            {/* =================================
                SAVE VISIT
            ================================== */}
            {canSave && (
              <section className="bg-white border border-gray-200 rounded-lg mb-6">

                <div className="px-5 py-4 border-b border-gray-200">

                  <h3 className="text-base font-semibold text-gray-900">
                    Save Visit
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter the details of the customer visit.
                  </p>

                </div>

                <form
                  onSubmit={
                    handleSaveVisit
                  }
                  className="p-5"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Customer */}
                    <div>
                      <label
                        htmlFor="customerName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Customer / Shop Name
                      </label>

                      <input
                        id="customerName"
                        name="customerName"
                        type="text"
                        value={customerName}
                        onChange={(e) =>
                          setCustomerName(
                            e.target.value
                          )
                        }
                        placeholder="Enter customer or shop name"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label
                        htmlFor="purpose"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Purpose
                      </label>

                      <input
                        id="purpose"
                        name="purpose"
                        type="text"
                        value={purpose}
                        onChange={(e) =>
                          setPurpose(
                            e.target.value
                          )
                        }
                        placeholder="Enter purpose of visit"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Outcome */}
                    <div>
                      <label
                        htmlFor="outcome"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outcome
                      </label>

                      <input
                        id="outcome"
                        name="outcome"
                        type="text"
                        value={outcome}
                        onChange={(e) =>
                          setOutcome(
                            e.target.value
                          )
                        }
                        placeholder="Enter outcome"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Location / Address
                      </label>

                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={location}
                        onChange={(e) =>
                          setLocation(
                            e.target.value
                          )
                        }
                        placeholder="Enter visit location"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Visit Date */}
                    <div>
                      <label
                        htmlFor="visitDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Visit Date / Time
                      </label>

                      <input
                        id="visitDate"
                        name="visitDate"
                        type="datetime-local"
                        value={visitDate}
                        onChange={(e) =>
                          setVisitDate(
                            e.target.value
                          )
                        }
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                  </div>

                  {/* Save Button */}
                  <div className="mt-5">

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Visit"}
                    </button>

                  </div>

                </form>

              </section>
            )}

            {/* =================================
                VISIT RECORDS
            ================================== */}
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

              {!hasVisitAccess ? (
                <div className="px-5 py-8">

                  <p className="text-sm font-medium text-gray-900">
                    Access denied.
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    You do not have permission to view visit records.
                  </p>

                </div>
              ) : visits.length === 0 ? (
                <div className="px-5 py-8">

                  <p className="text-sm font-medium text-gray-700">
                    No visit records found.
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Saved visits will appear here.
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
                          Customer
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                          Purpose
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                          Outcome
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                          Location
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                          Visit Date
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      {visits.map(
                        (visit) => (
                          <tr
                            key={visit.id}
                            className="hover:bg-gray-50"
                          >

                            {/* User */}
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

                            {/* Customer */}
                            <td className="px-5 py-4 text-sm font-medium text-gray-900">
                              {visit.customerName}
                            </td>

                            {/* Purpose */}
                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.purpose}
                            </td>

                            {/* Outcome */}
                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.outcome}
                            </td>

                            {/* Location */}
                            <td className="px-5 py-4 text-sm text-gray-700">
                              {visit.location}
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {formatDateTime(
                                visit.visitDate
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </section>

          </div>
        </section>
      </div>
    </main>
  );
}
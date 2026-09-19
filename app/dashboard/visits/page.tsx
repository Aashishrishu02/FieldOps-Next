"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { Header } from "../components/Header";
import { FormCardSkeleton, TableSkeleton } from "../components/DashboardSkeleton";
import { formatDateTime } from "@/lib/utils";

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
  const { user } = useUser();

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

  const refreshVisits = useCallback(async () => {
    try {
      const response = await fetch("/api/visits", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to refresh visits.");
        return;
      }

      setVisits(data.visits || data.records || []);
    } catch (err) {
      console.error("Visit refresh error:", err);
      setError("Something went wrong while refreshing visits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshVisits();
  }, [refreshVisits]);

  async function handleSaveVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/visits", {
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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save visit.");
        return;
      }

      setMessage("Visit saved successfully.");
      setCustomerName("");
      setPurpose("");
      setOutcome("");
      setLocation("");
      setVisitDate("");
      await refreshVisits();
    } catch (err) {
      console.error("Save visit error:", err);
      setError("Something went wrong while saving the visit.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-w-0">
        <Header
          title="Visits"
          subtitle="Create and view field visit records."
          backHref="/dashboard"
        />
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          <FormCardSkeleton />
          <TableSkeleton rows={4} />
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  const canSave = user.permissions.includes("SAVE_VISIT");
  const canReadSelf = user.permissions.includes("READ_SELF_VISIT");
  const canReadAll = user.permissions.includes("READ_ALL_VISIT");
  const hasVisitAccess = canReadSelf || canReadAll;

  return (
    <section className="min-w-0">
      <Header
        title="Visits"
        subtitle="Create and view field visit records."
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

        {canSave && (
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">
                Save Visit
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter the details of the customer visit.
              </p>
            </div>

            <form onSubmit={handleSaveVisit} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Customer / Shop Name
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer or shop name"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="purpose"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Purpose
                  </label>
                  <input
                    id="purpose"
                    name="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter purpose of visit"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="outcome"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Outcome
                  </label>
                  <input
                    id="outcome"
                    name="outcome"
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Enter outcome"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Location / Address
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter visit location"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="visitDate"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Visit Date / Time
                  </label>
                  <input
                    id="visitDate"
                    name="visitDate"
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="w-full sm:max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Visit"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">
              Visit Records
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {canReadAll
                ? "Visit records for all users."
                : canReadSelf
                ? "Your visit records."
                : "You do not have permission to view visits."}
            </p>
          </div>

          {!hasVisitAccess ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-gray-900">
                Access denied.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You do not have permission to view visit records.
              </p>
            </div>
          ) : visits.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                No visit records found.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Saved visits will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[640px] text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {canReadAll && (
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                        User
                      </th>
                    )}
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      Purpose
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      Outcome
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      Location
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      Visit Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      {canReadAll && (
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {visit.user?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {visit.user?.email || "-"}
                          </p>
                        </td>
                      )}

                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {visit.customerName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {visit.purpose}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {visit.outcome}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {visit.location}
                      </td>
                      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                        {formatDateTime(visit.visitDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
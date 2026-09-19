"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
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
      <div className="p-8 text-center text-sm text-gray-600">
        Loading visits...
      </div>
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
      <header className="bg-white border-b border-gray-200">
        <div className="px-5 sm:px-8 py-5 flex items-start gap-4">
          <Link
            href="/dashboard"
            className="mt-1 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            ← Dashboard
          </Link>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
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

            <form onSubmit={handleSaveVisit} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer or shop name"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
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
                    name="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter purpose of visit"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
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
                    name="outcome"
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Enter outcome"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
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
                    name="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter visit location"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
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
                    name="visitDate"
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Visit"}
                </button>
              </div>
            </form>
          </section>
        )}

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
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      {canReadAll && (
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {visit.user?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {visit.user?.email || "-"}
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
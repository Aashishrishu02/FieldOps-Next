"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { Header } from "../components/Header";

type CreateMode = "email" | "manual";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  mustChangePassword: boolean;
  passwordChangeAllowed: boolean;
  createdAt: string;
};

type GeneratedCredentials = {
  email: string;
  temporaryPassword: string;
};

export default function UserManagementPage() {
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [mode, setMode] = useState<CreateMode>("email");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(
    null
  );

  const isSuperAdmin =
    currentUser?.permissions.includes("MANAGE_USER_ACCOUNTS") ?? false;
  const canProvision =
    (currentUser?.permissions.includes("PROVISION_USERS") || isSuperAdmin) ??
    false;

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Load users error:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      void loadUsers();
    }
  }, [isSuperAdmin, loadUsers]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setCredentials(null);

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (mode === "email" && !email.trim()) {
      setError("Please enter the user's email address.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mode,
          email: mode === "email" ? email.trim() : "",
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create user.");
        return;
      }

      setMessage(data.message || "User created successfully.");

      if (data.credentials) {
        setCredentials({
          email: data.credentials.email,
          temporaryPassword: data.credentials.temporaryPassword,
        });
      }

      setEmail("");
      setRole("");

      if (isSuperAdmin) {
        await loadUsers();
      }
    } catch (err) {
      console.error("Create user error:", err);
      setError("Something went wrong while creating the user.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(userId: string, userEmail: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userEmail}?`
    );
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete user.");
        return;
      }

      setMessage(data.message || "User deleted successfully.");
      setUsers((current) => current.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Delete user error:", err);
      setError("Something went wrong while deleting the user.");
    }
  }

  async function copyCredentials() {
    if (!credentials) {
      return;
    }

    const text = `Login Email: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}`;

    try {
      await navigator.clipboard.writeText(text);
      setMessage("Credentials copied to clipboard.");
    } catch (err) {
      console.error("Copy error:", err);
      setError("Could not copy credentials.");
    }
  }

  function changeMode(nextMode: CreateMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setCredentials(null);
  }

  if (!currentUser) {
    return null;
  }

  if (!canProvision) {
    return (
      <div className="p-4 sm:p-8 text-center">
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Access Denied</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            You do not have permission to manage users.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 rounded-md bg-gray-900 text-white text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const availableRoles = isSuperAdmin
    ? ["Owner", "Manager", "Field Employee"]
    : ["Manager", "Field Employee"];

  return (
    <section className="min-w-0">
      <Header
        title="User Management"
        subtitle="Create user accounts and provide access credentials."
        backHref="/dashboard"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Create User</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose how credentials should be provided.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => changeMode("email")}
                className={`border rounded-md p-3.5 text-left transition-colors ${
                  mode === "email"
                    ? "border-blue-600 bg-blue-50/60"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  Send Credentials by Email
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Enter an email address to send temporary credentials via SMTP.
                </p>
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => changeMode("manual")}
                  className={`border rounded-md p-3.5 text-left transition-colors ${
                    mode === "manual"
                      ? "border-blue-600 bg-blue-50/60"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Generate Credentials
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    System generates a login ID and temporary password to share
                    directly.
                  </p>
                </button>
              )}
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {mode === "email" && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-900 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="role"
                  className="block text-xs sm:text-sm font-medium text-gray-900 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {availableRoles.map((roleName) => (
                    <option key={roleName} value={roleName}>
                      {roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 bg-gray-50 rounded-md p-3 text-xs text-gray-600">
                {mode === "email" ? (
                  <span>
                    A temporary password will be generated and sent to the provided
                    email address.
                  </span>
                ) : (
                  <span>
                    A login ID and temporary password will be generated and shown
                    below.
                  </span>
                )}
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-md px-3.5 py-2.5 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="border border-green-200 bg-green-50 text-green-700 rounded-md px-3.5 py-2.5 text-xs sm:text-sm">
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {creating
                    ? "Creating..."
                    : mode === "email"
                    ? "Create & Send Credentials"
                    : "Generate Credentials"}
                </button>
              </div>
            </form>

            {credentials && (
              <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                    Generated Credentials
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Give these credentials directly to the user.
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Login Email</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-all font-mono">
                      {credentials.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Temporary Password</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-all font-mono">
                      {credentials.temporaryPassword}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white bg-white transition-colors"
                  >
                    Copy Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {isSuperAdmin && (
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">
                Existing Users
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Accounts currently available in the system.
              </p>
            </div>

            {loadingUsers ? (
              <div className="p-4 sm:p-5 space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-50 rounded w-full flex items-center px-4 gap-4"
                  >
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-xs sm:text-sm text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[640px] text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        Name
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        Email / Login ID
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        Role
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        Password
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                          {item.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="max-w-xs truncate">{item.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                          {item.role}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.mustChangePassword ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                              Temporary
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                              Changed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.id === currentUser.id ? (
                            <span className="text-xs text-gray-400">
                              Current account
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item.id, item.email)}
                              className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}
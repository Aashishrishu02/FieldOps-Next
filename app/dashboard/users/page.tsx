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

type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: {
    name: string;
  };
};

export default function UsersPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(
    null
  );

  const [users, setUsers] = useState<
    ManagedUser[]
  >([]);

  const [name, setName] = useState("");
  const [role, setRole] = useState(
    "Field Employee"
  );

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [credentials, setCredentials] =
    useState<{
      name: string;
      email: string;
      password: string;
      role: string;
    } | null>(null);

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

        if (
          !userData.user.permissions.includes(
            "MANAGE_USER_ACCOUNTS"
          )
        ) {
          router.push("/unauthorized");
          return;
        }

        const usersResponse = await fetch(
          "/api/users",
          {
            credentials: "include",
          }
        );

        const usersData =
          await usersResponse.json();

        if (!usersResponse.ok) {
          if (active) {
            setError(
              usersData.message ||
                "Failed to load users."
            );
            setLoading(false);
          }
          return;
        }

        if (active) {
          setUser(userData.user);
          setUsers(usersData.users || []);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "User management loading error:",
          error
        );

        if (active) {
          setError(
            "Something went wrong while loading users."
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

  async function loadUsers() {
    try {
      const response = await fetch(
        "/api/users",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error(
        "User refresh error:",
        error
      );
    }
  }

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setMessage("");
    setCredentials(null);

    try {
      const response = await fetch(
        "/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create user."
        );
        return;
      }

      setMessage("User created successfully.");

      if (
        data.credentials
      ) {
        setCredentials(
          data.credentials
        );
      }

      setName("");
      setRole("Field Employee");

      await loadUsers();
    } catch (error) {
      console.error(
        "Create user error:",
        error
      );

      setError(
        "Something went wrong while creating the user."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete user."
        );
        return;
      }

      setMessage(
        "User deleted successfully."
      );

      await loadUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setError(
        "Something went wrong while deleting the user."
      );
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Loading users...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

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
                onClick={() =>
                  router.push("/dashboard/visits")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Visits
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard/roles")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Role Management
              </button>

              <button
                className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
              >
                User Management
              </button>

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
                  User Management
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Create and manage user accounts.
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

            {/* Create User */}
            <section className="bg-white border border-gray-200 rounded-lg mb-6">

              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Create User
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Create a new field operations account.
                </p>
              </div>

              <form
                onSubmit={handleCreateUser}
                className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5"
              >

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Role
                  </label>

                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Field Employee">
                      Field Employee
                    </option>

                    <option value="Manager">
                      Manager
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {creating
                      ? "Creating..."
                      : "Create User"}
                  </button>
                </div>

              </form>
            </section>

            {/* Generated Credentials */}
            {credentials && (
              <section className="bg-white border border-gray-200 rounded-lg mb-6">

                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    Generated Credentials
                  </h3>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Name
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {credentials.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Role
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {credentials.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {credentials.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Temporary Password
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {credentials.password}
                    </p>
                  </div>

                </div>
              </section>
            )}

            {/* Users */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Users
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Existing user accounts.
                </p>
              </div>

              {users.length === 0 ? (
                <div className="px-5 py-8">
                  <p className="text-sm text-gray-600">
                    No users found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                          Name
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                          Email
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                          Role
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      {users.map((managedUser) => (
                        <tr
                          key={managedUser.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-5 py-4 text-sm font-medium text-gray-900">
                            {managedUser.name ||
                              "Not provided"}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {managedUser.email}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-900">
                            {managedUser.role?.name ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  managedUser.id
                                )
                              }
                              disabled={
                                deletingId ===
                                managedUser.id ||
                                managedUser.id ===
                                  user.id
                              }
                              className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400"
                            >
                              {deletingId ===
                              managedUser.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
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
      </div>
    </main>
  );
}
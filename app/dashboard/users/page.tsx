"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type CreateMode = "email" | "manual";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string[];
};

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
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<UserData | null>(null);

  const [users, setUsers] =
    useState<UserRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [mode, setMode] =
    useState<CreateMode>("email");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [credentials, setCredentials] =
    useState<GeneratedCredentials | null>(
      null
    );

  /*
   * Load current logged-in user
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.user) {
          router.replace("/");
          return;
        }

        if (!cancelled) {
          setCurrentUser(data.user);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "CURRENT USER ERROR:",
          err
        );

        if (!cancelled) {
          router.replace("/");
        }
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
   * Load all users for Super Admin
   */
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const canManageUsers =
      currentUser.permissions.includes(
        "MANAGE_USER_ACCOUNTS"
      );

    if (!canManageUsers) {
      return;
    }

    async function loadUsers() {
      try {
        setLoadingUsers(true);

        const response = await fetch(
          "/api/users",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          response.ok &&
          Array.isArray(data.users)
        ) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error(
          "LOAD USERS ERROR:",
          err
        );
      } finally {
        setLoadingUsers(false);
      }
    }

    void loadUsers();
  }, [currentUser]);

  /*
   * Create user
   */
  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setCredentials(null);

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (
      mode === "email" &&
      !email.trim()
    ) {
      setError(
        "Please enter the user's email address."
      );
      return;
    }

    setCreating(true);

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
            mode,
            email:
              mode === "email"
                ? email.trim()
                : "",
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to create user."
        );
        return;
      }

      setMessage(
        data.message ||
          "User created successfully."
      );

      if (data.credentials) {
        setCredentials({
          email: data.credentials.email,
          temporaryPassword:
            data.credentials
              .temporaryPassword,
        });
      }

      setEmail("");
      setRole("");

      /*
       * Refresh users list
       */
      if (
        currentUser?.permissions?.includes(
          "MANAGE_USER_ACCOUNTS"
        )
      ) {
        const usersResponse =
          await fetch("/api/users", {
            credentials: "include",
            cache: "no-store",
          });

        const usersData =
          await usersResponse.json();

        if (
          usersResponse.ok &&
          Array.isArray(
            usersData.users
          )
        ) {
          setUsers(usersData.users);
        }
      }
    } catch (err) {
      console.error(
        "CREATE USER ERROR:",
        err
      );

      setError(
        "Something went wrong while creating the user."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * Delete user
   */
  async function handleDeleteUser(
    userId: string,
    userEmail: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete " +
        userEmail +
        "?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to delete user."
        );
        return;
      }

      setMessage(
        data.message ||
          "User deleted successfully."
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== userId
        )
      );
    } catch (err) {
      console.error(
        "DELETE USER ERROR:",
        err
      );

      setError(
        "Something went wrong while deleting the user."
      );
    }
  }

  /*
   * Copy generated credentials
   */
  async function copyCredentials() {
    if (!credentials) {
      return;
    }

    const text =
      "Login Email: " +
      credentials.email +
      "\n" +
      "Temporary Password: " +
      credentials.temporaryPassword;

    try {
      await navigator.clipboard.writeText(
        text
      );

      setMessage(
        "Credentials copied to clipboard."
      );
    } catch (err) {
      console.error(
        "COPY ERROR:",
        err
      );

      setError(
        "Could not copy credentials."
      );
    }
  }

  /*
   * Switch email/manual mode
   */
  function changeMode(
    nextMode: CreateMode
  ) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setCredentials(null);
  }

  /*
   * Logout
   */
  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );
    } finally {
      router.replace("/");
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            Loading...
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Checking your account access.
          </p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  /*
   * Permissions
   */
  const isSuperAdmin =
    currentUser.permissions.includes(
      "MANAGE_USER_ACCOUNTS"
    );

  const canProvision =
    currentUser.permissions.includes(
      "PROVISION_USERS"
    ) || isSuperAdmin;

  /*
   * No access
   */
  if (!canProvision) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Access Denied
          </h1>

          <p className="text-sm text-gray-600 mt-2">
            You do not have permission to manage users.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-5 px-4 py-2.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  /*
   * Roles
   */
  const availableRoles = isSuperAdmin
    ? [
        "Owner",
        "Manager",
        "Field Employee",
      ]
    : [
        "Manager",
        "Field Employee",
      ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =========================
          MOBILE HEADER
      ========================== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="h-16 px-4 flex items-center justify-between">

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-lg font-semibold text-gray-900"
          >
            FieldOps
          </button>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>

          </div>

        </div>
      </div>

      <div className="flex min-h-screen">

        {/* =========================
            DESKTOP SIDEBAR
        ========================== */}
        <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-white border-r border-gray-200">

          {/* Brand */}
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
                  router.push("/dashboard")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Dashboard
              </button>

              {/* Attendance */}
              {currentUser.permissions.includes(
                "READ_SELF_ATTENDANCE"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/attendance"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Attendance
                </button>
              )}

              {/* Visits */}
              {currentUser.permissions.includes(
                "READ_SELF_VISIT"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/visits"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Visits
                </button>
              )}

              {/* Roles */}
              {currentUser.permissions.includes(
                "MANAGE_ROLES"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/roles"
                    )
                  }
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Role Management
                </button>
              )}

              {/* Users */}
              {canProvision && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
                >
                  User Management
                </button>
              )}

            </div>
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">

            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser.name || "User"}
            </p>

            <p className="text-xs text-gray-500 truncate mt-1">
              {currentUser.email}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {currentUser.role}
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

        {/* =========================
            MAIN CONTENT
        ========================== */}
        <section className="flex-1 min-w-0 pt-16 md:pt-0">

          {/* Page header */}
          <header className="bg-white border-b border-gray-200">

            <div className="px-4 sm:px-6 lg:px-8 py-5">

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="text-sm text-gray-500 hover:text-gray-900 mb-3"
              >
                ← Dashboard
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Management
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Create user accounts and provide
                    access credentials.
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  Logged in as{" "}
                  <span className="font-medium text-gray-900">
                    {currentUser.role}
                  </span>
                </div>

              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl">

            {/* =========================
                CREATE USER
            ========================== */}
            <section className="bg-white border border-gray-200 rounded-lg">

              <div className="px-5 py-4 border-b border-gray-200">

                <h3 className="text-base font-semibold text-gray-900">
                  Create User
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Choose how credentials should be
                  provided.
                </p>

              </div>

              <div className="p-5">

                {/* Modes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">

                  {/* Email Mode */}
                  <button
                    type="button"
                    onClick={() =>
                      changeMode("email")
                    }
                    className={`border rounded-md p-4 text-left transition ${
                      mode === "email"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      Send Credentials by Email
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Enter a real email address.
                      A temporary password will be
                      generated and sent using SMTP.
                    </p>
                  </button>

                  {/* Manual Mode */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        changeMode("manual")
                      }
                      className={`border rounded-md p-4 text-left transition ${
                        mode === "manual"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        Generate Credentials
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        System generates a login ID
                        and temporary password for
                        you to give directly to the user.
                      </p>
                    </button>
                  )}

                </div>

                {/* Form */}
                <form onSubmit={handleCreateUser}>

                  {/* Email */}
                  {mode === "email" && (
                    <div className="mb-4">

                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-900 mb-2"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value
                          )
                        }
                        placeholder="user@example.com"
                        autoComplete="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-blue-500"
                      />

                    </div>
                  )}

                  {/* Role */}
                  <div className="mb-5">

                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Role
                    </label>

                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(event) =>
                        setRole(
                          event.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-blue-500"
                    >
                      <option value="">
                        Select a role
                      </option>

                      {availableRoles.map(
                        (roleName) => (
                          <option
                            key={roleName}
                            value={roleName}
                          >
                            {roleName}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* Info */}
                  <div className="border border-gray-200 bg-gray-50 rounded-md p-4 mb-5">

                    {mode === "email" ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          Email delivery
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          A temporary password will be
                          generated and sent to the
                          provided email address.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          Manual credentials
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          A login ID and temporary password
                          will be generated and shown below.
                        </p>
                      </>
                    )}

                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 border border-red-200 bg-red-50 text-red-700 rounded-md px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Success */}
                  {message && (
                    <div className="mb-4 border border-green-200 bg-green-50 text-green-700 rounded-md px-4 py-3 text-sm">
                      {message}
                    </div>
                  )}

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {creating
                      ? "Creating..."
                      : mode === "email"
                      ? "Create & Send Credentials"
                      : "Generate Credentials"}
                  </button>

                </form>

                {/* =========================
                    GENERATED CREDENTIALS
                ========================== */}
                {credentials && (
                  <div className="mt-6 border border-gray-300 rounded-lg">

                    <div className="px-5 py-4 border-b border-gray-200">

                      <h4 className="text-base font-semibold text-gray-900">
                        Generated Credentials
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        Give these credentials directly
                        to the user.
                      </p>

                    </div>

                    <div className="p-5 space-y-5">

                      <div>
                        <p className="text-xs text-gray-500">
                          Login Email
                        </p>

                        <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                          {credentials.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Temporary Password
                        </p>

                        <p className="text-sm font-medium text-gray-900 mt-1 break-all font-mono">
                          {credentials.temporaryPassword}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          copyCredentials
                        }
                        className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Copy Credentials
                      </button>

                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* =========================
                EXISTING USERS
            ========================== */}
            {isSuperAdmin && (
              <section className="bg-white border border-gray-200 rounded-lg mt-7">

                <div className="px-5 py-4 border-b border-gray-200">

                  <h3 className="text-base font-semibold text-gray-900">
                    Existing Users
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Accounts currently available
                    in the system.
                  </p>

                </div>

                {loadingUsers ? (
                  <div className="p-5 text-sm text-gray-500">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-5 text-sm text-gray-500">
                    No users found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[700px] text-sm">

                      <thead className="bg-gray-50 border-b border-gray-200">

                        <tr>
                          <th className="text-left px-5 py-3 font-medium text-gray-600">
                            Name
                          </th>

                          <th className="text-left px-5 py-3 font-medium text-gray-600">
                            Email / Login ID
                          </th>

                          <th className="text-left px-5 py-3 font-medium text-gray-600">
                            Role
                          </th>

                          <th className="text-left px-5 py-3 font-medium text-gray-600">
                            Password
                          </th>

                          <th className="text-left px-5 py-3 font-medium text-gray-600">
                            Action
                          </th>
                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-100">

                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50"
                          >

                            <td className="px-5 py-4 text-gray-900">
                              {user.name || "—"}
                            </td>

                            <td className="px-5 py-4 text-gray-700">
                              <div className="max-w-xs break-all">
                                {user.email}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-gray-900">
                              {user.role}
                            </td>

                            <td className="px-5 py-4">

                              {user.mustChangePassword ? (
                                <span className="text-amber-700">
                                  Temporary
                                </span>
                              ) : (
                                <span className="text-green-700">
                                  Changed
                                </span>
                              )}

                            </td>

                            <td className="px-5 py-4">

                              {user.id ===
                              currentUser.id ? (
                                <span className="text-xs text-gray-400">
                                  Current account
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user.id,
                                      user.email
                                    )
                                  }
                                  className="text-sm text-red-600 hover:text-red-800"
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
      </div>
    </main>
  );
}
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

type RolePermission = {
  permission: string;
};

type Role = {
  id: string;
  name: string;
  permissions: RolePermission[];
};

const allPermissions = [
  "READ_SELF_ATTENDANCE",
  "READ_ALL_ATTENDANCE",
  "CLOCK_IN_OUT",
  "READ_SELF_VISIT",
  "READ_ALL_VISIT",
  "SAVE_VISIT",
  "MANAGE_ROLES",
  "PROVISION_USERS",
  "MANAGE_USER_ACCOUNTS",
];

const permissionLabels: Record<string, string> = {
  READ_SELF_ATTENDANCE: "Read Self Attendance",
  READ_ALL_ATTENDANCE: "Read All Attendance",
  CLOCK_IN_OUT: "Clock In / Out",
  READ_SELF_VISIT: "Read Self Visit",
  READ_ALL_VISIT: "Read All Visit",
  SAVE_VISIT: "Save Visit",
  MANAGE_ROLES: "Manage Roles",
  PROVISION_USERS: "Provision Users",
  MANAGE_USER_ACCOUNTS: "Manage User Accounts",
};

export default function RolesPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

        if (
          !userData.user.permissions.includes("MANAGE_ROLES")
        ) {
          router.push("/unauthorized");
          return;
        }

        const roleResponse = await fetch("/api/roles", {
          credentials: "include",
        });

        const roleData = await roleResponse.json();

        if (!roleResponse.ok) {
          if (active) {
            setUser(userData.user);
            setError(
              roleData.message || "Failed to load roles."
            );
            setLoading(false);
          }

          return;
        }

        const loadedRoles: Role[] = roleData.roles || [];

        if (!active) {
          return;
        }

        setUser(userData.user);
        setRoles(loadedRoles);

        if (loadedRoles.length > 0) {
          const firstRole = loadedRoles[0];

          setSelectedRole(firstRole);

          setSelectedPermissions(
            firstRole.permissions.map(
              (item) => item.permission
            )
          );
        }

        setLoading(false);
      } catch (error) {
        console.error("Role loading error:", error);

        if (active) {
          setError(
            "Something went wrong while loading roles."
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

  function handleRoleSelect(role: Role) {
    setSelectedRole(role);

    setSelectedPermissions(
      role.permissions.map(
        (item) => item.permission
      )
    );

    setError("");
    setMessage("");
  }

  function togglePermission(permission: string) {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter(
          (item) => item !== permission
        );
      }

      return [...current, permission];
    });
  }

  async function handleSave() {
    if (!selectedRole) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          roleId: selectedRole.id,
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update permissions."
        );
        return;
      }

      const updatedPermissions: RolePermission[] =
        selectedPermissions.map((permission) => ({
          permission,
        }));

      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                permissions: updatedPermissions,
              }
            : role
        )
      );

      setSelectedRole((currentRole) =>
        currentRole
          ? {
              ...currentRole,
              permissions: updatedPermissions,
            }
          : null
      );

      setMessage(
        "Role permissions updated successfully."
      );
    } catch (error) {
      console.error(
        "Role update error:",
        error
      );

      setError(
        "Something went wrong while updating the role."
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Loading roles...
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
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </button>

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

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/visits")
                }
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Visits
              </button>

              <button
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-md text-sm bg-gray-100 text-gray-900 font-medium"
              >
                Role Management
              </button>

              {user.permissions.includes(
                "MANAGE_USER_ACCOUNTS"
              ) && (
                <button
                  type="button"
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
              type="button"
              onClick={handleLogout}
              className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
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
                  Role Management
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Manage permissions assigned to roles.
                </p>
              </div>

            </div>
          </header>

          {/* Content */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Roles List */}
              <section className="bg-white border border-gray-200 rounded-lg">

                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    Roles
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Select a role to manage its permissions.
                  </p>
                </div>

                <div className="p-3">

                  {roles.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-500">
                      No roles found.
                    </p>
                  ) : (
                    roles.map((role) => (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() =>
                          handleRoleSelect(role)
                        }
                        className={`w-full text-left px-4 py-3 rounded-md text-sm mb-1 transition ${
                          selectedRole?.id === role.id
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {role.name}
                      </button>
                    ))
                  )}

                </div>
              </section>

              {/* Permission Section */}
              <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">

                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedRole
                      ? `${selectedRole.name} Permissions`
                      : "Permissions"}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Select the permissions for this role.
                  </p>
                </div>

                <div className="p-5">

                  {!selectedRole ? (
                    <p className="text-sm text-gray-600">
                      Select a role from the left.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {allPermissions.map(
                          (permission) => {
                            const checked =
                              selectedPermissions.includes(
                                permission
                              );

                            return (
                              <label
                                key={permission}
                                className="flex items-start gap-3 border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    togglePermission(
                                      permission
                                    )
                                  }
                                  className="mt-1 h-4 w-4"
                                />

                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {permissionLabels[
                                      permission
                                    ] || permission}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {permission}
                                  </p>
                                </div>
                              </label>
                            );
                          }
                        )}

                      </div>

                      <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">

                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {saving
                            ? "Saving..."
                            : "Save Permissions"}
                        </button>

                      </div>
                    </>
                  )}

                </div>
              </section>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
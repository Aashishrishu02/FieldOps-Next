"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { Header } from "../components/Header";
import { permissionLabels } from "@/lib/types";

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

export default function RolesPage() {
  const router = useRouter();
  const { user } = useUser();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/roles", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load roles.");
        return;
      }

      const loadedRoles: Role[] = data.roles || [];
      setRoles(loadedRoles);

      if (loadedRoles.length > 0) {
        const firstRole = loadedRoles[0];
        setSelectedRole(firstRole);
        setSelectedPermissions(
          firstRole.permissions.map((item) => item.permission)
        );
      }
    } catch (err) {
      console.error("Role loading error:", err);
      setError("Something went wrong while loading roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!user.permissions.includes("MANAGE_ROLES")) {
      router.push("/unauthorized");
      return;
    }

    void loadRoles();
  }, [user, router, loadRoles]);

  function handleRoleSelect(role: Role) {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map((item) => item.permission));
    setError("");
    setMessage("");
  }

  function togglePermission(permission: string) {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
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
        setError(data.message || "Failed to update permissions.");
        return;
      }

      const updatedPermissions: RolePermission[] = selectedPermissions.map(
        (permission) => ({ permission })
      );

      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          role.id === selectedRole.id
            ? { ...role, permissions: updatedPermissions }
            : role
        )
      );

      setSelectedRole((currentRole) =>
        currentRole
          ? { ...currentRole, permissions: updatedPermissions }
          : null
      );

      setMessage("Role permissions updated successfully.");
    } catch (err) {
      console.error("Role update error:", err);
      setError("Something went wrong while updating the role.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-600">
        Loading roles...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="min-w-0">
      <Header
        title="Role Management"
        subtitle="Manage permissions assigned to roles."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Roles</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select a role to manage its permissions.
              </p>
            </div>

            <div className="p-2.5 sm:p-3 space-y-1">
              {roles.length === 0 ? (
                <p className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                  No roles found.
                </p>
              ) : (
                roles.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs sm:text-sm transition-colors ${
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

          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">
                {selectedRole
                  ? `${selectedRole.name} Permissions`
                  : "Permissions"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select the permissions for this role.
              </p>
            </div>

            <div className="p-4 sm:p-5">
              {!selectedRole ? (
                <p className="text-xs sm:text-sm text-gray-600">
                  Select a role from the left.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {allPermissions.map((permission) => {
                      const checked = selectedPermissions.includes(permission);

                      return (
                        <label
                          key={permission}
                          className="flex items-start gap-2.5 border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permission)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              {permissionLabels[permission] || permission}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 break-all">
                              {permission}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : "Save Permissions"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
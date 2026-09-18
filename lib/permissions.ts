import { Permission } from "@prisma/client";

export function hasPermission(
  permissions: Permission[],
  requiredPermission: Permission
) {
  return permissions.includes(requiredPermission);
}
import { prisma } from "../lib/prisma";
import { Permission } from "@prisma/client";
import { hashPassword } from "../lib/password";

async function main() {
  // =========================
  // CREATE ROLES
  // =========================

  const superAdmin = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: { name: "Super Admin" },
  });

  const owner = await prisma.role.upsert({
    where: { name: "Owner" },
    update: {},
    create: { name: "Owner" },
  });

  const manager = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: { name: "Manager" },
  });

  const fieldEmployee = await prisma.role.upsert({
    where: { name: "Field Employee" },
    update: {},
    create: { name: "Field Employee" },
  });

  // =========================
  // DEFINE PERMISSIONS
  // =========================

  const superAdminPermissions: Permission[] =
    Object.values(Permission);

  const ownerPermissions: Permission[] = [
    Permission.READ_SELF_ATTENDANCE,
    Permission.READ_ALL_ATTENDANCE,
    Permission.CLOCK_IN_OUT,
    Permission.READ_SELF_VISIT,
    Permission.READ_ALL_VISIT,
    Permission.SAVE_VISIT,
    Permission.MANAGE_ROLES,
    Permission.PROVISION_USERS,
  ];

  const managerPermissions: Permission[] = [
    Permission.READ_SELF_ATTENDANCE,
    Permission.READ_ALL_ATTENDANCE,
    Permission.CLOCK_IN_OUT,
    Permission.READ_SELF_VISIT,
    Permission.READ_ALL_VISIT,
    Permission.SAVE_VISIT,
  ];

  const fieldEmployeePermissions: Permission[] = [
    Permission.READ_SELF_ATTENDANCE,
    Permission.CLOCK_IN_OUT,
    Permission.READ_SELF_VISIT,
    Permission.SAVE_VISIT,
  ];

  // =========================
  // ASSIGN PERMISSIONS
  // =========================

  async function assignPermissions(
    roleId: string,
    permissions: Permission[]
  ) {
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permission,
      })),
    });
  }

  await assignPermissions(
    superAdmin.id,
    superAdminPermissions
  );

  await assignPermissions(
    owner.id,
    ownerPermissions
  );

  await assignPermissions(
    manager.id,
    managerPermissions
  );

  await assignPermissions(
    fieldEmployee.id,
    fieldEmployeePermissions
  );

  console.log("Roles and permissions seeded successfully.");

  // =========================
  // CREATE SUPER ADMIN USER
  // =========================

  const superAdminPassword = await hashPassword(
    "SuperAdmin@12345"
  );

  const superAdminUser = await prisma.user.upsert({
    where: {
      email: "admin@fieldops.com",
    },
    update: {
      name: "FieldOps Super Admin",
      password: superAdminPassword,
      roleId: superAdmin.id,
    },
    create: {
      name: "FieldOps Super Admin",
      email: "admin@fieldops.com",
      password: superAdminPassword,
      roleId: superAdmin.id,
    },
  });

  console.log(
    "Super Admin created:",
    superAdminUser.email
  );

  // =========================
  // CREATE OWNER USER
  // =========================

  const ownerPassword = await hashPassword(
    "Owner@12345"
  );

  const ownerUser = await prisma.user.upsert({
    where: {
      email: "owner@fieldops.com",
    },
    update: {
      name: "FieldOps Owner",
      password: ownerPassword,
      roleId: owner.id,
    },
    create: {
      name: "FieldOps Owner",
      email: "owner@fieldops.com",
      password: ownerPassword,
      roleId: owner.id,
    },
  });

  console.log(
    "Owner user created:",
    ownerUser.email
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
export type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string[];
};

export type NavigationItem = {
  name: string;
  path: string;
  permission?: string;
  exact?: boolean;
};

export const permissionLabels: Record<string, string> = {
  READ_SELF_ATTENDANCE: "View Own Attendance",
  READ_ALL_ATTENDANCE: "View All Attendance",
  CLOCK_IN_OUT: "Clock In / Out",
  READ_SELF_VISIT: "View Own Visits",
  READ_ALL_VISIT: "View All Visits",
  SAVE_VISIT: "Save Visits",
  MANAGE_ROLES: "Manage Roles",
  PROVISION_USERS: "Provision Users",
  MANAGE_USER_ACCOUNTS: "Manage User Accounts",
};

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    exact: true,
  },
  {
    name: "Attendance",
    path: "/dashboard/attendance",
    permission: "READ_SELF_ATTENDANCE",
  },
  {
    name: "Visits",
    path: "/dashboard/visits",
    permission: "READ_SELF_VISIT",
  },
  {
    name: "Role Management",
    path: "/dashboard/roles",
    permission: "MANAGE_ROLES",
  },
  {
    name: "User Management",
    path: "/dashboard/users",
    permission: "MANAGE_USER_ACCOUNTS",
  },
];

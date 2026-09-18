# FieldOps Access Test

FieldOps Access Test is a field operations management application built using **Next.js, TypeScript, PostgreSQL, and Prisma**.

The application provides secure authentication, permission-based RBAC, attendance tracking, field visit management, role management, and user provisioning.

---

## Features

### Authentication
- Email/password login
- Google login
- Forgot password flow
- Reset password using secure token/link
- Logout
- Protected frontend routes
- Protected backend APIs
- JWT-based authentication

### RBAC
The application uses **permission-based authorization** instead of depending only on role names.

Available permissions:

- `READ_SELF_ATTENDANCE`
- `READ_ALL_ATTENDANCE`
- `CLOCK_IN_OUT`
- `READ_SELF_VISIT`
- `READ_ALL_VISIT`
- `SAVE_VISIT`
- `MANAGE_ROLES`
- `PROVISION_USERS`
- `MANAGE_USER_ACCOUNTS`

### Roles

#### Owner
Owner can:
- View attendance
- Clock in/out
- View visits
- Save visits
- Manage role permissions
- Provision users

#### Manager
Manager can:
- View attendance
- Clock in/out
- View visits
- Save visits

#### Field Employee
Field Employee can:
- Clock in/out
- View own attendance
- View own visits
- Save visits

#### Super Admin
Super Admin has access to all available permissions and can manage users and roles.

---

## RBAC Architecture

Authorization is based on permissions.

```text
User
  ↓
Role
  ↓
Role Permissions
  ↓
Custom User Permissions
  ↓
Effective Permissions
  ↓
Frontend / Backend Permission Check
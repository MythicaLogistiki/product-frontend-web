"use client";

import * as React from "react";

type Role = "admin" | "standard";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  userRole: Role;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  userRole,
  fallback = null,
}: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

export function AdminOnly({
  children,
  userRole,
  fallback,
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin"]} userRole={userRole} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

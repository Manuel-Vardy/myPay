"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Key } from "lucide-react";

type AuthMeResponse = {
  user?: { id: string; email: string; role: string };
  roles?: Array<{ id: string; name: string; is_system_role: boolean }>;
  permissions?: string[];
  isSuperAdmin?: boolean;
  error?: string;
};

type Props = {
  requiredPermission?: string;
  requiredPermissions?: string[];
  children: ReactNode;
};

export function AdminPermissionGuard({
  requiredPermission,
  requiredPermissions,
  children,
}: Props) {
  const [auth, setAuth] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setAuth(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-[color:var(--trite-muted)]">Verifying security permissions...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = Boolean(auth?.isSuperAdmin);
  const userPermissions = auth?.permissions ?? [];
  const needed = requiredPermissions ?? (requiredPermission ? [requiredPermission] : []);

  const hasAccess =
    isSuperAdmin ||
    needed.length === 0 ||
    needed.some((p) => userPermissions.includes(p));

  if (!hasAccess) {
    const rolesList = auth?.roles?.map((r) => r.name).join(", ") || "Assigned Admin Role";

    return (
      <div className="mx-auto my-12 max-w-xl rounded-3xl border border-amber-200/60 bg-amber-50/30 p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your account (assigned <b>{rolesList}</b>) does not have sufficient permissions to view or manage this section.
        </p>
        
        {needed.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-100/60 px-3 py-1.5 text-xs font-mono font-medium text-amber-800">
            <Key className="h-3.5 w-3.5" />
            Required: {needed.join(" | ")}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

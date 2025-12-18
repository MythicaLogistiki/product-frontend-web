"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to organizations page by default
    router.replace("/admin/orgs");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-zinc-500">Redirecting...</p>
    </div>
  );
}

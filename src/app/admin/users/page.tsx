"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-zinc-400">Manage platform users across all organizations</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4">
          <Users className="h-12 w-12 text-zinc-700" />
          <p className="text-zinc-500">User management coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

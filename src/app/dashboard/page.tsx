"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Database, Shield, User, LogOut, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminOnly } from "@/components/guards/role-guard";
import { SupportWidget } from "@/components/support-widget";
import { PlaidLinkButton } from "@/components/plaid-link";
import { api } from "@/lib/api";

type Role = "admin" | "standard";

interface UserInfo {
  email: string;
  tenantId: string;
  role: Role;
}

// Mock data fetcher
async function fetchRecord(id: string, tenantId: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (!id.trim()) return null;
  return {
    id,
    name: `Record ${id}`,
    status: "active",
    createdAt: new Date().toISOString(),
    tenantId,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [searchId, setSearchId] = useState("");
  const [record, setRecord] = useState<Awaited<ReturnType<typeof fetchRecord>>>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenData = api.decodeToken();
    if (!tokenData) {
      router.push("/login");
      return;
    }
    setUser({
      email: tokenData.sub,
      tenantId: tokenData.tenant_id,
      role: tokenData.role as Role,
    });
  }, [router]);

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    const result = await fetchRecord(searchId, user.tenantId);
    setRecord(result);
    setLoading(false);
  };

  const handleLogout = () => {
    api.clearToken();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Database className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Phase Zero</span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant={user.role === "admin" ? "success" : "secondary"}>
              {user.role === "admin" ? (
                <Shield className="mr-1 h-3 w-3" />
              ) : (
                <User className="mr-1 h-3 w-3" />
              )}
              {user.role}
            </Badge>
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user.email}
          </p>
        </div>

        {/* Bank Connection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-muted-foreground" />
              Bank Connection
            </CardTitle>
            <CardDescription>
              Connect your bank account to sync transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlaidLinkButton
              onSuccess={(itemId, institutionName) => {
                console.log("Connected:", itemId, institutionName);
              }}
              onError={(error) => {
                console.error("Plaid error:", error);
              }}
            />
          </CardContent>
        </Card>

        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              Search Record
            </CardTitle>
            <CardDescription>
              Enter a record ID to fetch its details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter record ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Loading..." : "Get Record"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {record && (
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{record.name}</CardTitle>
                <Badge variant="success">{record.status}</Badge>
              </div>
              <CardDescription>ID: {record.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tenant ID</dt>
                  <dd className="font-mono text-xs">{record.tenantId}</dd>
                </div>
              </dl>

              {/* Admin-only actions */}
              <AdminOnly userRole={user.role}>
                <div className="mt-6 flex gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm">
                    Edit Record
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                    Delete Record
                  </Button>
                </div>
              </AdminOnly>
            </CardContent>
          </Card>
        )}

        {/* Admin Panel - Only visible to admins */}
        <AdminOnly userRole={user.role}>
          <Card className="mt-6 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <Shield className="h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                Administrative controls (only visible to admins)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  Manage Users
                </Button>
                <Button variant="secondary" size="sm">
                  View Audit Log
                </Button>
                <Button variant="secondary" size="sm">
                  Tenant Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminOnly>
      </main>

      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
}

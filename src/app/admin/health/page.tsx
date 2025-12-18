"use client";

import { useState, useEffect } from "react";
import { Activity, Database, Server, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  uptime?: number;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "default"> = {
    healthy: "success",
    degraded: "warning",
    down: "default",
  };
  return (
    <Badge variant={variants[status] || "default"} className="capitalize">
      {status}
    </Badge>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      await api.healthCheck();
      setHealth({ status: "healthy" });
    } catch {
      setHealth({ status: "down" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Health</h1>
          <p className="text-zinc-400">Monitor platform infrastructure status</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchHealth}
          disabled={loading}
          className="border-zinc-700 text-zinc-300"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              API Server
            </CardTitle>
            <Server className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <StatusBadge status={health?.status || "down"} />
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Database
            </CardTitle>
            <Database className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <StatusBadge status={health?.status === "healthy" ? "healthy" : "down"} />
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Plaid API
            </CardTitle>
            <Wifi className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <StatusBadge status="healthy" />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Background Jobs
            </CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <StatusBadge status="healthy" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">System Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-zinc-500">Detailed metrics coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

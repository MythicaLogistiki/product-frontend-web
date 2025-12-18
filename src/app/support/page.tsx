"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface DashboardStats {
  totalTenants: number;
  activeSessions: number;
  recentLookups: number;
}

interface RecentActivity {
  id: string;
  action: string;
  tenantName: string;
  tenantSlug: string;
  timestamp: string;
}

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    activeSessions: 0,
    recentLookups: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch tenant count from admin API
        const tenantsResponse = await api.adminGetTenants(1, 1);
        setStats({
          totalTenants: tenantsResponse.total,
          activeSessions: 0, // Will be implemented with session tracking
          recentLookups: 0,
        });

        // Mock recent activity for now
        setRecentActivity([]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Support Dashboard</h1>
        <p className="text-zinc-400">
          Overview of customer support activities and quick actions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/support/lookup">
          <Card className="border-cyan-500/20 bg-zinc-900 transition-colors hover:border-cyan-500/40 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                <Search className="h-6 w-6 text-cyan-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Customer Lookup</h3>
                <p className="text-sm text-zinc-400">
                  Search and access customer accounts
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/support/sessions">
          <Card className="border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800">
                <Users className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Active Sessions</h3>
                <p className="text-sm text-zinc-400">
                  View your impersonation sessions
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <p className="text-2xl font-bold text-white">{stats.totalTenants}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Active Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <p className="text-2xl font-bold text-white">{stats.activeSessions}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Lookups Today
            </CardTitle>
            <Search className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <p className="text-2xl font-bold text-white">{stats.recentLookups}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-zinc-700 mb-3" />
              <p className="text-zinc-500">No recent activity</p>
              <p className="text-sm text-zinc-600 mt-1">
                Your customer lookups and sessions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {activity.tenantName} ({activity.tenantSlug})
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-500">Support Guidelines</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              <li>• Only access customer accounts when explicitly requested</li>
              <li>• All impersonation sessions are logged for audit purposes</li>
              <li>• Sessions automatically expire after 1 hour of inactivity</li>
              <li>• Never share customer data outside of support channels</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

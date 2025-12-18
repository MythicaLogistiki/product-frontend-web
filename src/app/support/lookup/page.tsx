"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  ExternalLink,
  Clock,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Tenant } from "@/lib/admin-types";

export default function CustomerLookupPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Initial load - get all tenants
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const response = await api.adminGetTenants(1, 20);
        setTenants(response.items);
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
        toast.error("Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Search with debounce
  const handleSearch = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const response = await api.adminGetTenants(1, 20, query || undefined);
      setTenants(response.items);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleImpersonate = async (tenant: Tenant) => {
    setImpersonatingId(tenant.id);
    try {
      // Start impersonation session via API
      const session = await api.supportStartImpersonation(tenant.id);

      // Store the impersonation context
      api.setTenantSlug(tenant.slug);
      localStorage.setItem("impersonation_session", JSON.stringify({
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        sessionId: session.session_id,
        expiresAt: session.expires_at,
      }));

      toast.success(`Accessing ${tenant.name}`, {
        description: "You are now viewing this organization's data",
      });

      // Redirect to the tenant's dashboard
      router.push(`/${tenant.slug}/dashboard`);
    } catch (error) {
      console.error("Impersonation failed:", error);
      toast.error("Failed to start session", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setImpersonatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Customer Lookup</h1>
        <p className="text-zinc-400">
          Search for organizations and access their accounts for support
        </p>
      </div>

      {/* Search */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search by organization name, slug, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 focus:border-cyan-500"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Organizations</span>
            <Badge variant="outline" className="text-zinc-400">
              {tenants.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-zinc-800"
                />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-zinc-700 mb-3" />
              <p className="text-zinc-500">No organizations found</p>
              <p className="text-sm text-zinc-600 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700">
                      <Building2 className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{tenant.name}</h3>
                        <Badge
                          variant={tenant.is_active ? "success" : "default"}
                          className="text-xs"
                        >
                          {tenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-zinc-500">
                          {tenant.subscription_tier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                        <span className="font-mono text-xs">{tenant.slug}</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tenant.user_count || 0} users
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {formatDate(tenant.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImpersonate(tenant)}
                    disabled={impersonatingId === tenant.id || !tenant.is_active}
                    className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10"
                  >
                    {impersonatingId === tenant.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accessing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Access
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-500">
            Access is logged for audit purposes
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            All customer account access is recorded with your identity, timestamp,
            and actions taken. Only access accounts when necessary for support.
          </p>
        </div>
      </div>
    </div>
  );
}

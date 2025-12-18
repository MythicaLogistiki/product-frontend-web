"use client";

import { useState, useEffect } from "react";
import { Clock, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  tenantName: string;
  tenantSlug: string;
  startedAt: string;
  expiresAt: string;
}

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for active impersonation session
    const storedSession = localStorage.getItem("impersonation_session");
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt > new Date()) {
          setSessions([{
            id: session.sessionId,
            tenantName: session.tenantName,
            tenantSlug: session.tenantSlug,
            startedAt: new Date().toISOString(),
            expiresAt: session.expiresAt,
          }]);
        }
      } catch (e) {
        console.error("Failed to parse session:", e);
      }
    }
    setLoading(false);
  }, []);

  const handleEndSession = (sessionId: string) => {
    localStorage.removeItem("impersonation_session");
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Active Sessions</h1>
        <p className="text-zinc-400">
          Manage your current customer impersonation sessions
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Your Sessions</span>
            <Badge variant="outline" className="text-zinc-400">
              {sessions.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-zinc-800"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-zinc-700 mb-3" />
              <p className="text-zinc-500">No active sessions</p>
              <p className="text-sm text-zinc-600 mt-1">
                Start a session from Customer Lookup to access customer accounts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">
                        {session.tenantName}
                      </h3>
                      <Badge className="bg-cyan-500/20 text-cyan-500">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span className="font-mono text-xs">{session.tenantSlug}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires at {formatTime(session.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEndSession(session.id)}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    End Session
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Session Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p>
            <strong className="text-zinc-300">Duration:</strong> Sessions automatically
            expire after 1 hour of inactivity or 4 hours maximum.
          </p>
          <p>
            <strong className="text-zinc-300">Logging:</strong> All actions taken during
            impersonation are logged with your identity for audit purposes.
          </p>
          <p>
            <strong className="text-zinc-300">Best Practice:</strong> End sessions
            promptly after completing support tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  LayoutDashboard,
  Users,
  HeadphonesIcon,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { Toaster } from "sonner";

interface SupportUser {
  email: string;
  role: string;
}

const SIDEBAR_ITEMS = [
  {
    name: "Dashboard",
    href: "/support",
    icon: LayoutDashboard,
  },
  {
    name: "Customer Lookup",
    href: "/support/lookup",
    icon: Search,
  },
  {
    name: "Active Sessions",
    href: "/support/sessions",
    icon: Users,
  },
];

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SupportUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenData = api.decodeToken();

    if (!tokenData) {
      router.push("/login");
      return;
    }

    // Check if user is support agent or platform admin
    const allowedRoles = ["support_agent", "platform_admin"];
    if (!allowedRoles.includes(tokenData.role)) {
      router.push("/dashboard");
      return;
    }

    setUser({
      email: tokenData.sub,
      role: tokenData.role,
    });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    api.clearToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-cyan-500/20 bg-zinc-900">
        {/* Support Header */}
        <div className="flex h-16 items-center gap-3 border-b border-cyan-500/20 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500">
            <HeadphonesIcon className="h-5 w-5 text-black" />
          </div>
          <div>
            <span className="font-semibold text-white">Numbersence</span>
            <Badge className="ml-2 bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/20">
              SUPPORT
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/support" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-cyan-500/20 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-cyan-500/20 text-cyan-500 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user.email}
              </p>
              <p className="text-xs text-zinc-500">Support Agent</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cyan-500/20 bg-zinc-900/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-500">
              SUPPORT MODE
            </Badge>
            <span className="text-sm text-zinc-500">
              Customer Support Console
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>

      {/* Toast notifications */}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            border: "1px solid #06b6d433",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

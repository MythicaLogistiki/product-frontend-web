"use client";

import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw, Loader2 } from "lucide-react";

interface TransactionEmptyStateProps {
  onSync?: () => void;
  syncing?: boolean;
  hasPlaidItem?: boolean;
}

export function TransactionEmptyState({
  onSync,
  syncing,
  hasPlaidItem,
}: TransactionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">No transactions yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {hasPlaidItem
          ? "Click sync to fetch your latest transactions"
          : "Connect a bank account to see your transactions"}
      </p>
      {hasPlaidItem && onSync && (
        <Button onClick={onSync} disabled={syncing} size="sm">
          {syncing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </div>
  );
}

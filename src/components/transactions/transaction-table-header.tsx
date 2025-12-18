"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Loader2, Calendar, X } from "lucide-react";

interface TransactionTableHeaderProps {
  onSync: () => void;
  syncing: boolean;
  loading: boolean;
  onFilterChange: (startDate: string, endDate: string) => void;
  hasPlaidItem: boolean;
  startDate?: string;
  endDate?: string;
}

export function TransactionTableHeader({
  onSync,
  syncing,
  loading,
  onFilterChange,
  hasPlaidItem,
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
}: TransactionTableHeaderProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleApplyFilter = () => {
    onFilterChange(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    onFilterChange("", "");
  };

  const hasFilters = startDate || endDate;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-32 text-sm"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-32 text-sm"
        />
        <Button variant="secondary" size="sm" onClick={handleApplyFilter}>
          Apply
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilter}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hasPlaidItem && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing || loading}
        >
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

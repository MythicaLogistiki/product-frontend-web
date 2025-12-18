"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import type { Transaction, TransactionFilters } from "@/lib/types";
import { TransactionRow } from "./transaction-row";
import { TransactionEmptyState } from "./transaction-empty-state";
import { TransactionTableHeader } from "./transaction-table-header";
import { TransactionPagination } from "./transaction-pagination";
import { TransactionTableSkeleton } from "./transaction-skeleton";

interface TransactionTableProps {
  plaidItemId?: string;
  onSyncComplete?: () => void;
}

export function TransactionTable({
  plaidItemId,
  onSyncComplete,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TransactionFilters>({
    start_date: undefined,
    end_date: undefined,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getTransactions({
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize,
      });
      setTransactions(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.total_pages,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSync = async () => {
    if (!plaidItemId) return;
    setSyncing(true);
    setError(null);
    try {
      await api.syncPlaidItem(plaidItemId);
      await fetchTransactions();
      onSyncComplete?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sync transactions"
      );
    } finally {
      setSyncing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDateFilter = (startDate: string, endDate: string) => {
    setFilters({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Empty state
  if (!loading && transactions.length === 0 && !error) {
    return (
      <TransactionEmptyState
        onSync={handleSync}
        syncing={syncing}
        hasPlaidItem={!!plaidItemId}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TransactionTableHeader
        onSync={handleSync}
        syncing={syncing}
        loading={loading}
        onFilterChange={handleDateFilter}
        hasPlaidItem={!!plaidItemId}
      />

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <TransactionTableSkeleton />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[100px] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <TransactionPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

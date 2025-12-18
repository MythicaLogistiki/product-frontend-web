"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionTableSkeleton() {
  return (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </TableCell>
              <TableCell className="text-right">
                <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

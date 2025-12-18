"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  getCategoryVariant,
  formatCategory,
} from "@/lib/format";

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const displayName = transaction.merchant_name || transaction.name;
  const isIncome = transaction.amount < 0; // Plaid uses negative for income

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        {formatDate(transaction.transaction_date)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{displayName}</span>
          {transaction.pending && (
            <span className="text-xs text-muted-foreground">Pending</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getCategoryVariant(transaction.category_primary)}>
          {formatCategory(transaction.category_primary)}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-mono">
        <span className={isIncome ? "text-emerald-500" : ""}>
          {formatCurrency(transaction.amount, transaction.iso_currency_code)}
        </span>
      </TableCell>
    </TableRow>
  );
}

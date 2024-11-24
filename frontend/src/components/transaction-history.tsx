"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Loader2 } from "lucide-react";
import { useEventLogs } from "@/hooks/use-event-logs";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

interface Transaction {
  id: string;
  date: Date;
  action: "mint" | "burn";
  usdcAmount: number;
  bltmAmount: number;
}

export function TransactionHistory() {
  const isLoggedIn = useIsLoggedIn();
  const { transactions, isLoading, isError } = useEventLogs();

  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = React.useState("");

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.action.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.usdcAmount.toString().includes(filter) ||
        transaction.bltmAmount.toString().includes(filter)
    );
  }, [transactions, filter]);

  const requestSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderTransactionContent = () => {
    if (!isLoggedIn) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8">
            Connect wallet to see transaction history
          </TableCell>
        </TableRow>
      );
    }

    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading transactions...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8 text-red-500">
            Error loading transactions. Please try again.
          </TableCell>
        </TableRow>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8">
            No transactions found
          </TableCell>
        </TableRow>
      );
    }

    return filteredTransactions.map((transaction) => (
      <TableRow key={transaction.id}>
        <TableCell className="capitalize">
          {transaction.action}
        </TableCell>
        <TableCell className="text-right">
          {transaction.usdcAmount.toFixed(2)}
        </TableCell>
        <TableCell className="text-right">
          {transaction.bltmAmount.toFixed(2)}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Transaction History</h1>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <div className="rounded-md border bg-gradient-to-br from-gray-900 to-black text-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" onClick={() => requestSort("action")}>
                    Action
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("usdcAmount")}
                  >
                    USDC Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("bltmAmount")}
                  >
                    BLTM Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTransactionContent()}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

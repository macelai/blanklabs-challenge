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
import { ArrowUpDown, Search } from "lucide-react";

interface Transaction {
  id: string;
  date: Date;
  action: "mint" | "burn";
  usdcAmount: number;
  bltmAmount: number;
}

// This would typically come from your blockchain events
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2023-06-01"),
    action: "mint",
    usdcAmount: 1000,
    bltmAmount: 500,
  },
  {
    id: "2",
    date: new Date("2023-06-02"),
    action: "burn",
    usdcAmount: 500,
    bltmAmount: 250,
  },
  {
    id: "3",
    date: new Date("2023-06-03"),
    action: "mint",
    usdcAmount: 2000,
    bltmAmount: 1000,
  },
  {
    id: "4",
    date: new Date("2023-06-04"),
    action: "burn",
    usdcAmount: 1500,
    bltmAmount: 750,
  },
];

export function TransactionHistory() {
  const [transactions, setTransactions] =
    React.useState<Transaction[]>(mockTransactions);
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = React.useState("");

  const sortedTransactions = React.useMemo(() => {
    const sortableTransactions = [...transactions];
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [transactions, sortConfig]);

  const filteredTransactions = React.useMemo(() => {
    return sortedTransactions.filter(
      (transaction) =>
        transaction.action.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.usdcAmount.toString().includes(filter) ||
        transaction.bltmAmount.toString().includes(filter) ||
        transaction.date.toLocaleDateString().includes(filter)
    );
  }, [sortedTransactions, filter]);

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" onClick={() => requestSort("date")}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
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
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.date.toLocaleDateString()}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

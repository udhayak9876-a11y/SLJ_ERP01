import { AccountGroup } from "@prisma/client";

export interface DefaultAccount {
  accountCode: string;
  accountName: string;
  accountGroup: AccountGroup;
}

export const DEFAULT_ACCOUNTS: DefaultAccount[] = [
  { accountCode: "1001", accountName: "Cash in Hand", accountGroup: "ASSET" },
  { accountCode: "1002", accountName: "Bank Account", accountGroup: "ASSET" },
  { accountCode: "1100", accountName: "Sundry Debtors", accountGroup: "ASSET" },
  { accountCode: "1200", accountName: "Gold Stock", accountGroup: "ASSET" },
  { accountCode: "2001", accountName: "Sundry Creditors", accountGroup: "LIABILITY" },
  { accountCode: "2100", accountName: "CGST Payable", accountGroup: "LIABILITY" },
  { accountCode: "2101", accountName: "SGST Payable", accountGroup: "LIABILITY" },
  { accountCode: "2102", accountName: "IGST Payable", accountGroup: "LIABILITY" },
  { accountCode: "3001", accountName: "Capital Account", accountGroup: "EQUITY" },
  { accountCode: "4001", accountName: "Sales - Jewellery", accountGroup: "INCOME" },
  { accountCode: "5001", accountName: "Purchases - Gold", accountGroup: "EXPENSE" },
  { accountCode: "5002", accountName: "Old Metal Purchase", accountGroup: "EXPENSE" },
  { accountCode: "5003", accountName: "General Expenses", accountGroup: "EXPENSE" },
];

export const ACCOUNT_CODES = {
  CASH: "1001",
  BANK: "1002",
  DEBTORS: "1100",
  CREDITORS: "2001",
  CGST: "2100",
  SGST: "2101",
  IGST: "2102",
  SALES: "4001",
  PURCHASES: "5001",
  OLD_METAL: "5002",
  EXPENSES: "5003",
} as const;

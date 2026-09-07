import type { ExpenseRecord } from "../types/expense";

const STORAGE_KEY = "control-auto-expense-records";

export function getExpenseRecords(): ExpenseRecord[] {
  const storedRecords = localStorage.getItem(STORAGE_KEY);

  if (!storedRecords) {
    return [];
  }

  try {
    return JSON.parse(storedRecords) as ExpenseRecord[];
  } catch {
    return [];
  }
}

export function saveExpenseRecords(records: ExpenseRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
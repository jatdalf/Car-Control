export type ExpenseCategory =
  | "toll"
  | "parking"
  | "wash"
  | "insurance"
  | "tax"
  | "fine"
  | "accessories"
  | "other";

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  odometer: number | null;
  notes: string;
}
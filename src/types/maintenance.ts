export type MaintenanceCategory =
  | "oil"
  | "filters"
  | "timing"
  | "brakes"
  | "tires"
  | "battery"
  | "repair"
  | "inspection"
  | "other";

export interface MaintenanceRecord {
  id: string;
  date: string;
  category: MaintenanceCategory;
  description: string;
  odometer: number;
  cost: number;
  workshop: string;
  nextDate: string | null;
  nextOdometer: number | null;
  notes: string;
}
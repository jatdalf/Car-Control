export interface FuelRecord {
  id: string;
  date: string;
  odometer: number;
  liters: number;
  totalCost: number;
  station: string;
  fullTank: boolean;
  notes: string;
}   
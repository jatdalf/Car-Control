import type { FuelRecord } from "../types/fuel";

const STORAGE_KEY = "control-auto-fuel-records";

export function getFuelRecords(): FuelRecord[] {
  const storedRecords = localStorage.getItem(STORAGE_KEY);

  if (!storedRecords) {
    return [];
  }

  try {
    return JSON.parse(storedRecords) as FuelRecord[];
  } catch {
    return [];
  }
}

export function saveFuelRecords(records: FuelRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
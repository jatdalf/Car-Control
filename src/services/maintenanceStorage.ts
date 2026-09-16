import type { MaintenanceRecord } from "../types/maintenance";

const STORAGE_KEY = "control-auto-maintenance-records";

export function getMaintenanceRecords(): MaintenanceRecord[] {
  const storedRecords = localStorage.getItem(STORAGE_KEY);

  if (!storedRecords) {
    return [];
  }

  try {
    return JSON.parse(storedRecords) as MaintenanceRecord[];
  } catch {
    return [];
  }
}

export function saveMaintenanceRecords(
  records: MaintenanceRecord[],
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
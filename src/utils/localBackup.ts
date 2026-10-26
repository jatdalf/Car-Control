const STORAGE_KEYS = [
  "control-auto-fuel-records",
  "control-auto-expense-records",
  "control-auto-maintenance-records",
] as const;

export function exportLocalBackup() {
  const storage: Record<string, string | null> = {};

  for (const key of STORAGE_KEYS) {
    storage[key] = localStorage.getItem(key);
  }

  const hasData = Object.values(storage).some(
    (value) => value !== null && value !== "[]",
  );

  if (!hasData) {
    window.alert(
      "No se encontraron registros guardados en este dispositivo.",
    );
    return;
  }

  const backup = {
    version: 1,
    application: "Control Auto",
    exportedAt: new Date().toISOString(),
    origin: window.location.origin,
    storage,
  };

  const file = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];

  link.href = url;
  link.download = `control-auto-backup-${date}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
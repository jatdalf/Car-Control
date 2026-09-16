import { AlertTriangle, CalendarClock, CheckCircle2, Pencil, Plus, Trash2, Wrench, X} from "lucide-react";
import { useState, type FormEvent } from "react";
import { getFuelRecords } from "../../services/fuelStorage";
import { getMaintenanceRecords, saveMaintenanceRecords} from "../../services/maintenanceStorage";
import type { MaintenanceCategory, MaintenanceRecord } from "../../types/maintenance";

interface MaintenanceForm {
  date: string;
  category: MaintenanceCategory;
  description: string;
  odometer: string;
  cost: string;
  workshop: string;
  nextDate: string;
  nextOdometer: string;
  notes: string;
}

type MaintenanceStatus = "current" | "upcoming" | "overdue" | "none";

const categoryLabels: Record<MaintenanceCategory, string> = {
  oil: "Aceite",
  filters: "Filtros",
  timing: "Distribución",
  brakes: "Frenos",
  tires: "Neumáticos",
  battery: "Batería",
  repair: "Reparación",
  inspection: "Inspección",
  other: "Otro",
};

const statusLabels: Record<MaintenanceStatus, string> = {
  current: "Vigente",
  upcoming: "Próximo",
  overdue: "Vencido",
  none: "Sin próximo",
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

function getLocalDateValue() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialForm: MaintenanceForm = {
  date: getLocalDateValue(),
  category: "oil",
  description: "",
  odometer: "",
  cost: "",
  workshop: "",
  nextDate: "",
  nextOdometer: "",
  notes: "",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
}

function sortRecordsByDate(records: MaintenanceRecord[]) {
  return [...records].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return b.odometer - a.odometer;
  });
}

function getDaysUntil(date: string) {
  const today = new Date(`${getLocalDateValue()}T00:00:00`);
  const targetDate = new Date(`${date}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (targetDate.getTime() - today.getTime()) / millisecondsPerDay,
  );
}

function getMaintenanceStatus(
  record: MaintenanceRecord,
  currentOdometer: number,
): MaintenanceStatus {
  if (!record.nextDate && record.nextOdometer === null) {
    return "none";
  }

  const expiredByDate =
    record.nextDate !== null &&
    record.nextDate < getLocalDateValue();

  const expiredByOdometer =
    record.nextOdometer !== null &&
    currentOdometer >= record.nextOdometer;

  if (expiredByDate || expiredByOdometer) {
    return "overdue";
  }

  const upcomingByDate =
    record.nextDate !== null &&
    getDaysUntil(record.nextDate) <= 30;

  const upcomingByOdometer =
    record.nextOdometer !== null &&
    record.nextOdometer - currentOdometer <= 1000;

  if (upcomingByDate || upcomingByOdometer) {
    return "upcoming";
  }

  return "current";
}

export function Mantenimiento() {
  const fuelRecords = getFuelRecords();

  const currentOdometer = Math.max(
    0,
    ...fuelRecords.map((record) => record.odometer),
  );

  const [records, setRecords] = useState<MaintenanceRecord[]>(() =>
    sortRecordsByDate(getMaintenanceRecords()),
  );

  const [form, setForm] =
    useState<MaintenanceForm>(initialForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const totalMaintenanceCost = records.reduce(
    (total, record) => total + record.cost,
    0,
  );

  const overdueCount = records.filter(
    (record) =>
      getMaintenanceStatus(record, currentOdometer) === "overdue",
  ).length;

  const upcomingCount = records.filter(
    (record) =>
      getMaintenanceStatus(record, currentOdometer) === "upcoming",
  ).length;

  function openNewForm() {
    setEditingId(null);
    setError("");

    setForm({
      ...initialForm,
      date: getLocalDateValue(),
      odometer:
        currentOdometer > 0 ? String(currentOdometer) : "",
    });

    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setError("");
    setShowForm(false);

    setForm({
      ...initialForm,
      date: getLocalDateValue(),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const odometer = Number(form.odometer);
    const cost = Number(form.cost);
    const nextOdometer = form.nextOdometer
      ? Number(form.nextOdometer)
      : null;

    if (
      !form.date ||
      !form.description.trim() ||
      !form.odometer ||
      !form.cost
    ) {
      setError(
        "Completá la fecha, la descripción, el kilometraje y el importe.",
      );
      return;
    }

    if (odometer <= 0) {
      setError("El kilometraje debe ser mayor a cero.");
      return;
    }

    if (cost < 0) {
      setError("El importe no puede ser negativo.");
      return;
    }

    if (
      nextOdometer !== null &&
      nextOdometer <= odometer
    ) {
      setError(
        "El kilometraje del próximo servicio debe ser mayor al kilometraje actual.",
      );
      return;
    }

    if (form.nextDate && form.nextDate <= form.date) {
      setError(
        "La fecha del próximo servicio debe ser posterior a la fecha del mantenimiento.",
      );
      return;
    }

    const savedRecord: MaintenanceRecord = {
      id: editingId ?? crypto.randomUUID(),
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      odometer,
      cost,
      workshop: form.workshop.trim(),
      nextDate: form.nextDate || null,
      nextOdometer,
      notes: form.notes.trim(),
    };

    const otherRecords = records.filter(
      (record) => record.id !== editingId,
    );

    const updatedRecords = sortRecordsByDate([
      savedRecord,
      ...otherRecords,
    ]);

    setRecords(updatedRecords);
    saveMaintenanceRecords(updatedRecords);
    closeForm();
  }

  function handleEdit(record: MaintenanceRecord) {
    setForm({
      date: record.date,
      category: record.category,
      description: record.description,
      odometer: String(record.odometer),
      cost: String(record.cost),
      workshop: record.workshop,
      nextDate: record.nextDate ?? "",
      nextOdometer:
        record.nextOdometer !== null
          ? String(record.nextOdometer)
          : "",
      notes: record.notes,
    });

    setEditingId(record.id);
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "¿Querés eliminar este mantenimiento?",
    );

    if (!confirmed) {
      return;
    }

    const updatedRecords = records.filter(
      (record) => record.id !== id,
    );

    setRecords(updatedRecords);
    saveMaintenanceRecords(updatedRecords);
  }

  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Servicios</p>
          <h1>Mantenimiento</h1>
          <p>
            Controlá reparaciones, servicios y próximos mantenimientos.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openNewForm}
        >
          <Plus size={19} />
          Nuevo mantenimiento
        </button>
      </section>

      <section className="maintenance-summary-grid">
        <article className="maintenance-summary-card">
          <div className="maintenance-summary-card__icon maintenance-summary-card__icon--blue">
            <Wrench size={22} />
          </div>

          <div>
            <span>Total invertido</span>
            <strong>
              {currencyFormatter.format(totalMaintenanceCost)}
            </strong>
          </div>
        </article>

        <article className="maintenance-summary-card">
          <div className="maintenance-summary-card__icon maintenance-summary-card__icon--orange">
            <CalendarClock size={22} />
          </div>

          <div>
            <span>Próximos</span>
            <strong>{upcomingCount}</strong>
          </div>
        </article>

        <article className="maintenance-summary-card">
          <div className="maintenance-summary-card__icon maintenance-summary-card__icon--red">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Vencidos</span>
            <strong>{overdueCount}</strong>
          </div>
        </article>

        <article className="maintenance-summary-card">
          <div className="maintenance-summary-card__icon maintenance-summary-card__icon--green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Kilometraje actual</span>
            <strong>
              {currentOdometer > 0
                ? `${numberFormatter.format(currentOdometer)} km`
                : "Sin datos"}
            </strong>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="form-panel">
          <div className="form-panel__header">
            <div>
              <h2>
                {editingId
                  ? "Editar mantenimiento"
                  : "Nuevo mantenimiento"}
              </h2>

              <p>
                Registrá el trabajo realizado y el próximo servicio.
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={closeForm}
              aria-label="Cerrar formulario"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Fecha del trabajo *</span>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Categoría *</span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target
                        .value as MaintenanceCategory,
                    })
                  }
                >
                  {Object.entries(categoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="form-field">
                <span>Descripción *</span>

                <input
                  type="text"
                  placeholder="Ej.: Cambio de aceite y filtro"
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Kilometraje *</span>

                <input
                  type="number"
                  min="1"
                  placeholder="Ej.: 198000"
                  value={form.odometer}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      odometer: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Importe *</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej.: 65000"
                  value={form.cost}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      cost: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Taller o proveedor</span>

                <input
                  type="text"
                  placeholder="Opcional"
                  value={form.workshop}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      workshop: event.target.value,
                    })
                  }
                />
              </label>

              <div className="form-section-title">
                <CalendarClock size={18} />

                <div>
                  <strong>Próximo servicio</strong>
                  <span>
                    Completá uno o ambos campos para recibir alertas.
                  </span>
                </div>
              </div>

              <label className="form-field">
                <span>Próxima fecha</span>

                <input
                  type="date"
                  value={form.nextDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      nextDate: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Próximo kilometraje</span>

                <input
                  type="number"
                  min="1"
                  placeholder="Ej.: 208000"
                  value={form.nextOdometer}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      nextOdometer: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field form-field--full">
                <span>Observaciones</span>

                <textarea
                  rows={3}
                  placeholder="Repuestos utilizados u otra información"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancelar
              </button>

              <button type="submit" className="primary-button">
                {editingId
                  ? "Guardar cambios"
                  : "Guardar mantenimiento"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel records-panel">
        <div className="panel__header">
          <div>
            <h2>Historial de mantenimiento</h2>
            <p>{records.length} registros guardados</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <Wrench size={42} />
            <h3>Todavía no hay mantenimientos</h3>
            <p>
              Registrá un cambio de aceite, reparación o servicio.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Servicio</th>
                  <th>Kilometraje</th>
                  <th>Importe</th>
                  <th>Próximo</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {records.map((record) => {
                  const status = getMaintenanceStatus(
                    record,
                    currentOdometer,
                  );

                  return (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>

                      <td>
                        <div className="maintenance-service">
                          <strong>{record.description}</strong>

                          <span>
                            {categoryLabels[record.category]}
                            {record.workshop
                              ? ` · ${record.workshop}`
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td>
                        {numberFormatter.format(record.odometer)} km
                      </td>

                      <td className="expense-amount">
                        {currencyFormatter.format(record.cost)}
                      </td>

                      <td>
                        <div className="maintenance-next">
                          {record.nextDate && (
                            <span>
                              {formatDate(record.nextDate)}
                            </span>
                          )}

                          {record.nextOdometer !== null && (
                            <span>
                              {numberFormatter.format(
                                record.nextOdometer,
                              )}{" "}
                              km
                            </span>
                          )}

                          {!record.nextDate &&
                            record.nextOdometer === null && (
                              <span>—</span>
                            )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`maintenance-status maintenance-status--${status}`}
                        >
                          {statusLabels[status]}
                        </span>
                      </td>

                      <td>
                        <div className="record-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(record)}
                            aria-label="Editar mantenimiento"
                            title="Editar"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(record.id)
                            }
                            aria-label="Eliminar mantenimiento"
                            title="Eliminar"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
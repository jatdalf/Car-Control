import { Fuel, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  getFuelRecords,
  saveFuelRecords,
} from "../../services/fuelStorage";
import type { FuelRecord } from "../../types/fuel";

interface FuelForm {
  date: string;
  odometer: string;
  liters: string;
  totalCost: string;
  station: string;
  fullTank: boolean;
  notes: string;
}

const initialForm: FuelForm = {
  date: new Date().toISOString().split("T")[0],
  odometer: "",
  liters: "",
  totalCost: "",
  station: "",
  fullTank: true,
  notes: "",
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function Combustible() {
  const [records, setRecords] = useState<FuelRecord[]>(getFuelRecords);
  const [form, setForm] = useState<FuelForm>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const odometer = Number(form.odometer);
    const liters = Number(form.liters);
    const totalCost = Number(form.totalCost);

    if (!form.date || odometer <= 0 || liters <= 0 || totalCost <= 0) {
      setError("Completá la fecha, el kilometraje, los litros y el importe.");
      return;
    }

    const highestOdometer = Math.max(
      0,
      ...records.map((record) => record.odometer),
    );

    if (odometer < highestOdometer) {
      setError(
        `El kilometraje no puede ser menor al último registrado (${numberFormatter.format(
          highestOdometer,
        )} km).`,
      );
      return;
    }

    const newRecord: FuelRecord = {
      id: crypto.randomUUID(),
      date: form.date,
      odometer,
      liters,
      totalCost,
      station: form.station.trim(),
      fullTank: form.fullTank,
      notes: form.notes.trim(),
    };

    const updatedRecords = [newRecord, ...records].sort(
      (a, b) => b.odometer - a.odometer,
    );

    setRecords(updatedRecords);
    saveFuelRecords(updatedRecords);
    setForm({
      ...initialForm,
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "¿Querés eliminar esta carga de combustible?",
    );

    if (!confirmed) {
      return;
    }

    const updatedRecords = records.filter((record) => record.id !== id);

    setRecords(updatedRecords);
    saveFuelRecords(updatedRecords);
  }

  function closeForm() {
    setShowForm(false);
    setError("");
  }

  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Registros</p>
          <h1>Combustible</h1>
          <p>Registrá y consultá todas las cargas de combustible.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={19} />
          Nueva carga
        </button>
      </section>

      {showForm && (
        <section className="form-panel">
          <div className="form-panel__header">
            <div>
              <h2>Nueva carga</h2>
              <p>Ingresá los datos indicados en el comprobante.</p>
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
                <span>Fecha *</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </label>

              <label className="form-field">
                <span>Kilometraje actual *</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Ej.: 85200"
                  value={form.odometer}
                  onChange={(event) =>
                    setForm({ ...form, odometer: event.target.value })
                  }
                />
              </label>

              <label className="form-field">
                <span>Litros cargados *</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ej.: 42.5"
                  value={form.liters}
                  onChange={(event) =>
                    setForm({ ...form, liters: event.target.value })
                  }
                />
              </label>

              <label className="form-field">
                <span>Importe total *</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ej.: 52000"
                  value={form.totalCost}
                  onChange={(event) =>
                    setForm({ ...form, totalCost: event.target.value })
                  }
                />
              </label>

              <label className="form-field">
                <span>Estación de servicio</span>
                <input
                  type="text"
                  placeholder="Ej.: YPF"
                  value={form.station}
                  onChange={(event) =>
                    setForm({ ...form, station: event.target.value })
                  }
                />
              </label>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.fullTank}
                  onChange={(event) =>
                    setForm({ ...form, fullTank: event.target.checked })
                  }
                />

                <span>
                  <strong>Tanque completo</strong>
                  Necesario para calcular correctamente el consumo.
                </span>
              </label>

              <label className="form-field form-field--full">
                <span>Observaciones</span>
                <textarea
                  rows={3}
                  placeholder="Información adicional de la carga"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
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
                Guardar carga
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel records-panel">
        <div className="panel__header">
          <div>
            <h2>Historial de cargas</h2>
            <p>{records.length} registros guardados</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <Fuel size={42} />
            <h3>Todavía no hay cargas</h3>
            <p>Agregá tu primera carga para comenzar el seguimiento.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Kilometraje</th>
                  <th>Litros</th>
                  <th>Precio/L</th>
                  <th>Total</th>
                  <th>Estación</th>
                  <th>Tanque</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      {new Date(
                        `${record.date}T00:00:00`,
                      ).toLocaleDateString("es-AR")}
                    </td>
                    <td>{numberFormatter.format(record.odometer)} km</td>
                    <td>{numberFormatter.format(record.liters)} L</td>
                    <td>
                      {currencyFormatter.format(
                        record.totalCost / record.liters,
                      )}
                    </td>
                    <td>{currencyFormatter.format(record.totalCost)}</td>
                    <td>{record.station || "—"}</td>
                    <td>
                      <span
                        className={`record-badge ${
                          record.fullTank
                            ? "record-badge--complete"
                            : "record-badge--partial"
                        }`}
                      >
                        {record.fullTank ? "Completo" : "Parcial"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(record.id)}
                        aria-label="Eliminar carga"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
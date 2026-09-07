import {
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  getExpenseRecords,
  saveExpenseRecords,
} from "../../services/expenseStorage";
import type {
  ExpenseCategory,
  ExpenseRecord,
} from "../../types/expense";

interface ExpenseForm {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  odometer: string;
  notes: string;
}

const initialForm: ExpenseForm = {
  date: new Date().toISOString().split("T")[0],
  category: "toll",
  description: "",
  amount: "",
  odometer: "",
  notes: "",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  toll: "Peaje",
  parking: "Estacionamiento",
  wash: "Lavado",
  insurance: "Seguro",
  tax: "Patente",
  fine: "Multa",
  accessories: "Accesorios",
  other: "Otro",
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

function sortRecordsByDate(records: ExpenseRecord[]) {
  return [...records].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return b.id.localeCompare(a.id);
  });
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
}

export function Gastos() {
  const [records, setRecords] = useState<ExpenseRecord[]>(() =>
    sortRecordsByDate(getExpenseRecords()),
  );

  const [form, setForm] = useState<ExpenseForm>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const totalExpenses = records.reduce(
    (total, record) => total + record.amount,
    0,
  );

  function openNewForm() {
    setEditingId(null);
    setError("");

    setForm({
      ...initialForm,
      date: new Date().toISOString().split("T")[0],
    });

    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setError("");
    setShowForm(false);

    setForm({
      ...initialForm,
      date: new Date().toISOString().split("T")[0],
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const amount = Number(form.amount);
    const odometer = form.odometer ? Number(form.odometer) : null;

    if (!form.date || !form.description.trim() || amount <= 0) {
      setError("Completá la fecha, la descripción y el importe.");
      return;
    }

    if (odometer !== null && odometer <= 0) {
      setError("El kilometraje debe ser mayor a cero.");
      return;
    }

    const savedRecord: ExpenseRecord = {
      id: editingId ?? crypto.randomUUID(),
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      amount,
      odometer,
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
    saveExpenseRecords(updatedRecords);
    closeForm();
  }

  function handleEdit(record: ExpenseRecord) {
    setForm({
      date: record.date,
      category: record.category,
      description: record.description,
      amount: String(record.amount),
      odometer:
        record.odometer !== null ? String(record.odometer) : "",
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
      "¿Querés eliminar este gasto?",
    );

    if (!confirmed) {
      return;
    }

    const updatedRecords = records.filter(
      (record) => record.id !== id,
    );

    setRecords(updatedRecords);
    saveExpenseRecords(updatedRecords);
  }

  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Registros</p>
          <h1>Gastos</h1>
          <p>
            Administrá peajes, seguros, estacionamientos y otros gastos.
          </p>
        </div>

        <button className="primary-button" onClick={openNewForm}>
          <Plus size={19} />
          Nuevo gasto
        </button>
      </section>

      <section className="expense-summary">
        <div className="expense-summary__icon">
          <ReceiptText size={25} />
        </div>

        <div>
          <span>Total de gastos registrados</span>
          <strong>{currencyFormatter.format(totalExpenses)}</strong>
        </div>
      </section>

      {showForm && (
        <section className="form-panel">
          <div className="form-panel__header">
            <div>
              <h2>
                {editingId ? "Editar gasto" : "Nuevo gasto"}
              </h2>

              <p>
                {editingId
                  ? "Corregí los datos del gasto seleccionado."
                  : "Ingresá los datos del comprobante o movimiento."}
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
                <span>Fecha *</span>

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
                      category: event.target.value as ExpenseCategory,
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
                  placeholder="Ej.: Peaje Córdoba"
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
                <span>Importe *</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ej.: 2500"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field">
                <span>Kilometraje</span>

                <input
                  type="number"
                  min="1"
                  placeholder="Opcional"
                  value={form.odometer}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      odometer: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-field form-field--full">
                <span>Observaciones</span>

                <textarea
                  rows={3}
                  placeholder="Información adicional"
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
                {editingId ? "Guardar cambios" : "Guardar gasto"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel records-panel">
        <div className="panel__header">
          <div>
            <h2>Historial de gastos</h2>
            <p>{records.length} registros guardados</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <ReceiptText size={42} />
            <h3>Todavía no hay gastos</h3>
            <p>
              Agregá un peaje, estacionamiento u otro gasto para comenzar.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Kilometraje</th>
                  <th>Importe</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>

                    <td>
                      <span
                        className={`expense-category expense-category--${record.category}`}
                      >
                        {categoryLabels[record.category]}
                      </span>
                    </td>

                    <td>{record.description}</td>

                    <td>
                      {record.odometer !== null
                        ? `${numberFormatter.format(
                            record.odometer,
                          )} km`
                        : "—"}
                    </td>

                    <td className="expense-amount">
                      {currencyFormatter.format(record.amount)}
                    </td>

                    <td>
                      <div className="record-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(record)}
                          aria-label="Editar gasto"
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(record.id)}
                          aria-label="Eliminar gasto"
                          title="Eliminar"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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
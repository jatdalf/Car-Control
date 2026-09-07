import { CircleDollarSign, Fuel, Gauge, Route, Wrench, } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { getFuelRecords } from "../../services/fuelStorage";
import type { FuelRecord } from "../../types/fuel";

interface ConsumptionPoint {
  date: string;
  consumption: number;
  kilometers: number;
  liters: number;
  cost: number;
}

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2,});

function calculateConsumption(records: FuelRecord[]) {
  const chronologicalRecords = [...records].sort((a, b) => a.date.localeCompare(b.date),);

  const points: ConsumptionPoint[] = [];
  let previousFullTankIndex: number | null = null;

  chronologicalRecords.forEach((record, currentIndex) => {
    if (!record.fullTank) {
      return;
    }

    if (previousFullTankIndex !== null) {
      const previousFullTank = chronologicalRecords[previousFullTankIndex];
      const kilometers = record.odometer - previousFullTank.odometer;
      const periodRecords = chronologicalRecords.slice(previousFullTankIndex + 1, currentIndex + 1,);
      const liters = periodRecords.reduce((total, currentRecord) => total + currentRecord.liters, 0,);
      const cost = periodRecords.reduce((total, currentRecord) => total + currentRecord.totalCost, 0,);

      if (kilometers > 0 && liters > 0) {
        points.push({
          date: new Date(`${record.date}T00:00:00`).toLocaleDateString("es-AR",
            { day: "2-digit", month: "2-digit", },),
          consumption: Number(((liters / kilometers) * 100).toFixed(2)),
          kilometers,
          liters,
          cost,
        });
      }
    }
    previousFullTankIndex = currentIndex;
  });

  const totalKilometers = points.reduce((total, point) => total + point.kilometers, 0,);
  const totalLiters = points.reduce((total, point) => total + point.liters, 0,);
  const totalMeasuredCost = points.reduce((total, point) => total + point.cost, 0,);
  const averageConsumption = totalKilometers > 0 ? (totalLiters / totalKilometers) * 100 : 0;

  return { points, totalKilometers, totalMeasuredCost, averageConsumption,};
}

export function Dashboard() {
  const records = useMemo(() => getFuelRecords(), []);

  const {points: consumptionPoints, totalKilometers, totalMeasuredCost, averageConsumption,} 
    = useMemo(() => calculateConsumption(records), [records]);

  const totalCost = records.reduce((total, record) => total + record.totalCost, 0,);
  const totalLiters = records.reduce((total, record) => total + record.liters, 0,);
  const averageLiterPrice = totalLiters > 0 ? totalCost / totalLiters : 0;
  const costPerKilometer = totalKilometers > 0 ? totalMeasuredCost / totalKilometers : 0;
  const recentRecords = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const summaryCards = [
    {
      title: "Kilómetros controlados",
      value: `${decimalFormatter.format(totalKilometers)} km`,
      detail: consumptionPoints.length > 0 ? `${consumptionPoints.length} períodos calculados`
          : "Faltan cargas completas",
      icon: Route,
      color: "blue",
    },
    {
      title: "Consumo promedio",
      value: `${decimalFormatter.format(averageConsumption)} L/100 km`,
      detail: consumptionPoints.length > 0 ? "Promedio entre tanques completos"
          : "Se necesitan al menos 2 cargas",
      icon: Fuel,
      color: "orange",
    },
    {
      title: "Total en combustible",
      value: currencyFormatter.format(totalCost),
      detail: `${decimalFormatter.format(totalLiters)} litros registrados`,
      icon: CircleDollarSign,
      color: "green",
    },
    {
      title: "Costo por kilómetro",
      value: currencyFormatter.format(costPerKilometer),
      detail: averageLiterPrice > 0 ? `${currencyFormatter.format(averageLiterPrice)} por litro`
          : "Sin registros",
      icon: Gauge,
      color: "purple",
    },
  ];

  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Panel principal</p>
          <h1>Resumen del vehículo</h1>
          <p>Controlá el consumo, los kilómetros y todos tus gastos.</p>
        </div>

        <Link className="primary-button primary-button--link" to="/combustible">
          <Fuel size={19} /> Nueva carga
        </Link>
      </section>

      <section className="summary-grid">
        {summaryCards.map(({ title, value, detail, icon: Icon, color }) => (
          <article className="summary-card" key={title}>
            <div className={`summary-card__icon summary-card__icon--${color}`}>
              <Icon size={23} />
            </div>

            <p>{title}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel__header">
            <div>
              <h2>Consumo de combustible</h2>
              <p>Litros consumidos cada 100 kilómetros</p>
            </div>

            {averageConsumption > 0 && (
              <span className="consumption-average">
                Promedio: {decimalFormatter.format(averageConsumption)}
              </span>
            )}
          </div>

          {consumptionPoints.length === 0 ? (
            <div className="empty-state">
              <Fuel size={42} />
              <h3>No hay datos suficientes</h3>
              <p>
                Se necesitan al menos dos cargas con tanque completo para
                calcular el consumo.
              </p>
            </div>
          ) : (
            <div className="consumption-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={consumptionPoints}
                  margin={{ top: 20, right: 20, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#e8edf4" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7c8798", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7c8798", fontSize: 12 }}
                    unit=" L"
                  />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e2e7ee",
                      borderRadius: "10px",
                      boxShadow: "0 8px 25px rgb(15 23 42 / 10%)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumo"
                    unit=" L/100 km"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", strokeWidth: 3, r: 5, }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Últimas cargas</h2>
              <p>Registros más recientes</p>
            </div>

            <Link className="text-link" to="/combustible">
              Ver todas
            </Link>
          </div>

          {recentRecords.length === 0 ? (
            <div className="empty-state empty-state--small">
              <Fuel size={38} />
              <h3>Sin cargas registradas</h3>
            </div>
          ) : (
            <div className="recent-records">
              {recentRecords.map((record) => (
                <div className="recent-record" key={record.id}>
                  <div className="recent-record__icon">
                    <Fuel size={19} />
                  </div>

                  <div className="recent-record__content">
                    <strong>
                      {decimalFormatter.format(record.liters)} litros
                    </strong>

                    <span>
                      {new Date(`${record.date}T00:00:00`,).toLocaleDateString("es-AR")}
                      {" · "}
                      {decimalFormatter.format(record.odometer)} km
                    </span>
                  </div>

                  <strong className="recent-record__amount">
                    {currencyFormatter.format(record.totalCost)}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="maintenance-reminder">
            <Wrench size={20} />

            <div>
              <strong>Mantenimiento</strong>
              <span>Próximamente podrás configurar recordatorios.</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
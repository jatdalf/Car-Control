import {ArrowDown, ArrowUp, CircleDollarSign, Fuel, Gauge, Route,} from "lucide-react";
import { Link } from "react-router-dom";

const summaryCards = [{
    title: "Kilómetros recorridos",
    value: "0 km",
    detail: "Este mes",
    icon: Route,
    color: "blue",
  },{
    title: "Consumo promedio",
    value: "0,0 L/100 km",
    detail: "Sin registros",
    icon: Fuel,
    color: "orange",
  },{
    title: "Gastos del mes",
    value: "$ 0",
    detail: "Sin gastos",
    icon: CircleDollarSign,
    color: "green",
  },{
    title: "Costo por kilómetro",
    value: "$ 0,00",
    detail: "Promedio mensual",
    icon: Gauge,
    color: "purple",
  },];

export function Dashboard() {
  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Panel principal</p>
          <h1>Resumen del vehículo</h1>
          <p>Controlá el consumo, los kilómetros y todos tus gastos.</p>
        </div>

        <Link className="primary-button primary-button--link" to="/combustible">
        <Fuel size={19} /> Nueva carga </Link>
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
              <p>Evolución durante los últimos meses</p>
            </div>

            <span className="status">
              <ArrowDown size={15} />
              Sin datos
            </span>
          </div>

          <div className="empty-state">
            <Fuel size={42} />
            <h3>Todavía no hay cargas</h3>
            <p>Registrá combustible para comenzar a analizar el consumo.</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Próximo mantenimiento</h2>
              <p>Servicios pendientes</p>
            </div>

            <ArrowUp size={19} />
          </div>

          <div className="empty-state empty-state--small">
            <WrenchIcon />
            <h3>Sin mantenimientos</h3>
            <p>Agregá el próximo cambio de aceite o servicio.</p>
          </div>
        </article>
      </section>
    </div>
  );
}

function WrenchIcon() {
  return (
    <div className="maintenance-icon">
      <Gauge size={34} />
    </div>
  );
}
import { Wrench } from "lucide-react";

export function Mantenimiento() {
  return (
    <div className="page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Servicios</p>
          <h1>Mantenimiento</h1>
          <p>
            Controlá cambios de aceite, reparaciones y próximos servicios.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="empty-state">
          <Wrench size={42} />

          <h3>Todavía no hay mantenimientos</h3>

          <p>
            Agregá un cambio de aceite, reparación o servicio para comenzar.
          </p>
        </div>
      </section>
    </div>
  );
}
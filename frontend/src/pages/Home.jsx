import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, FileLock2, Building2, Car, Wrench } from "lucide-react";
import StatCard from "../components/StatCard";
import { api } from "../lib/api";
import { fmtNumber } from "../lib/format";

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <section className="text-center max-w-3xl mx-auto">
        <span className="badge bg-brand-50 text-brand-700 mb-4">
          <ShieldCheck size={14} /> Verificable on-chain
        </span>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
          Historial vehicular oficial,
          <br />
          inmutable desde los 0km.
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed">
          Cada service oficial se sella en blockchain por la red de concesionarias autorizadas.
          Sin papeles, sin alteraciones, sin ambiguedad.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/consulta" className="btn-primary">
            <Search size={16} /> Consultar un vehiculo
          </Link>
          <Link to="/login" className="btn-secondary">
            <Building2 size={16} /> Acceso concesionarias
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        <StatCard
          icon={<Car size={18} />}
          label="Vehiculos registrados"
          value={fmtNumber(stats?.vehiculos_registrados ?? 0)}
          hint="Altas oficiales certificadas"
        />
        <StatCard
          icon={<Wrench size={18} />}
          label="Eventos en cadena"
          value={fmtNumber(stats?.servicios_registrados ?? 0)}
          hint="Servicios sellados en Polygon"
        />
        <StatCard
          icon={<Building2 size={18} />}
          label="Concesionarias activas"
          value={fmtNumber(stats?.concesionarias_activas ?? 0)}
          hint="Wallets autorizadas en el contrato"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <Feature
          icon={<FileLock2 size={20} />}
          title="Evidencia hasheada"
          desc="La orden de trabajo se almacena cifrada y su hash SHA-256 viaja a la blockchain. Cualquier alteracion del archivo rompe la prueba."
        />
        <Feature
          icon={<ShieldCheck size={20} />}
          title="Solo concesionarias oficiales"
          desc="Unicamente wallets autorizadas en el contrato pueden registrar eventos. Talleres particulares y dueños no pueden adulterar el linaje."
        />
        <Feature
          icon={<Search size={20} />}
          title="Consulta sin cuenta"
          desc="Cualquier comprador puede ingresar el VIN o la patente y obtener el historial completo verificado en cadena."
        />
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="card p-6">
      <div className="text-brand-500 mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

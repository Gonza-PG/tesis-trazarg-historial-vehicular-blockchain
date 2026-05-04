import { useState } from "react";
import { Search, ShieldCheck, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber, fmtDate, shorten, txUrl } from "../lib/format";
import KilometrajeChart from "../components/KilometrajeChart";
import ServiciosChart from "../components/ServiciosChart";
import EventoCard from "../components/EventoCard";

export default function ConsultaPublica() {
  const [identificador, setIdentificador] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const r = await api.consultaPublica(identificador.trim());
      setData(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold">Consultar historial</h1>
        <p className="text-sm text-slate-600 mt-2">
          Ingresa el VIN o la patente del vehiculo. La consulta es gratuita y no requiere cuenta.
        </p>
      </div>

      <form onSubmit={buscar} className="flex gap-2 max-w-xl mx-auto">
        <input
          className="input font-mono"
          placeholder="VIN o patente (ej. AB123CD)"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary">
          <Search size={16} /> {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
          {error}
        </div>
      )}

      {data && <Resultado data={data} />}
    </div>
  );
}

function Resultado({ data }) {
  const { vehiculo, eventos, cadena } = data;
  const ultimo = eventos[eventos.length - 1];

  return (
    <div className="mt-10 space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="badge bg-emerald-50 text-emerald-700">
              <ShieldCheck size={14} /> Verificado on-chain
            </span>
            <h2 className="text-2xl font-semibold mt-2">
              {vehiculo.marca} {vehiculo.modelo} <span className="text-slate-500 font-normal">({vehiculo.anio})</span>
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div><span className="text-slate-500">VIN:</span> <span className="font-mono">{vehiculo.vin}</span></div>
              <div><span className="text-slate-500">Patente:</span> {vehiculo.patente || "—"}</div>
              <div><span className="text-slate-500">Color:</span> {vehiculo.color || "—"}</div>
              <div><span className="text-slate-500">Alta:</span> {fmtDate(vehiculo.creado_en)}</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-slate-500 text-xs">Kilometraje al ultimo registro</div>
            <div className="text-3xl font-semibold">{fmtNumber(ultimo?.kilometraje ?? 0)} <span className="text-base text-slate-500">km</span></div>
            <div className="text-xs text-slate-500 mt-1">{fmtDate(ultimo?.chain_timestamp)}</div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          <span>Contrato: <span className="font-mono">{shorten(cadena.contrato, 10, 6)}</span></span>
          <span>Chain ID: {cadena.chain_id}</span>
          <span>Eventos en cadena: {cadena.cantidad_eventos_on_chain}</span>
          {cadena.tx_hash_alta && (
            <a href={txUrl(cadena.tx_hash_alta)} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-600 inline-flex items-center gap-1">
              tx alta <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KilometrajeChart eventos={eventos} />
        <ServiciosChart eventos={eventos} />
      </div>

      <div>
        <h3 className="font-medium text-slate-700 mb-3">Linea de tiempo certificada</h3>
        <div className="space-y-3">
          {eventos.map((e, i) => (
            <EventoCard key={i} evento={e} esAlta={e.tipo_servicio === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

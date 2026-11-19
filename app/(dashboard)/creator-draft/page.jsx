"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

const formatoMXN = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const formatoFecha = (valor) => {
  if (!valor) return "Por definir";
  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function CreatorDraftPage() {
  const { currentUser, isAuthReady } = useAuth();
  const [supabase] = useState(() => createClient());
  const [campanas, setCampanas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthReady) return;
    if (currentUser?.type !== "creator") {
      setCargando(false);
      return;
    }

    let activa = true;
    async function cargarCampanas() {
      setCargando(true);
      setError("");

      const { data, error: consultaError } = await supabase
        .from("campaigns")
        .select("id, title, description, objective, deliverables, budget, due_date, status")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!activa) return;
      if (consultaError) {
        setError(consultaError.message);
      } else {
        const lista = data || [];
        setCampanas(lista);
        setSeleccionada(lista[0]?.id || null);
      }
      setCargando(false);
    }

    cargarCampanas();
    return () => {
      activa = false;
    };
  }, [currentUser?.id, currentUser?.type, isAuthReady, supabase]);

  if (!isAuthReady) {
    return <main className="flex-1 bg-[#080e1b] p-8 text-white">Cargando...</main>;
  }

  if (currentUser?.type !== "creator") {
    return (
      <main className="flex-1 bg-[#080e1b] p-8 text-white">
        Esta vista corresponde a los creadores de contenido.
      </main>
    );
  }

  const campana = campanas.find((c) => c.id === seleccionada);

  return (
    <main className="min-w-0 flex-1 bg-[#080e1b] p-5 text-white md:p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-sky-400">INDASOCIAL · CREADORES</p>
        <h1 className="mt-2 text-3xl font-bold">Mis colaboraciones</h1>
        <p className="mt-2 text-gray-400">
          Descubre oportunidades de marcas y consulta los detalles de cada campaña.
        </p>
      </header>

      <div className="mb-7 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-5">
          <p className="text-sm text-sky-300">Campañas publicadas</p>
          <p className="mt-2 text-3xl font-bold">{cargando ? "—" : campanas.length}</p>
          <p className="mt-1 text-xs text-gray-400">Oportunidades disponibles para consultar</p>
        </section>
        <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-5">
          <p className="text-sm text-sky-300">Seguimiento de colaboración</p>
          <p className="mt-2 text-base font-semibold">Pendiente de conexión</p>
          <p className="mt-1 text-xs text-gray-400">
            El timeline compartido aparecerá cuando exista una colaboración registrada.
          </p>
        </section>
      </div>

      {cargando && <p className="text-gray-300">Cargando campañas...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {!cargando && !error && campanas.length === 0 && (
        <div className="rounded-xl border border-sky-500/30 bg-[#101e35] p-6">
          No hay campañas publicadas visibles por el momento.
        </div>
      )}

      {!cargando && !error && campanas.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Campañas disponibles</h2>
            {campanas.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSeleccionada(c.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  seleccionada === c.id
                    ? "border-sky-400 bg-sky-950/70"
                    : "border-slate-700 bg-[#122036] hover:border-sky-600"
                }`}
              >
                <p className="font-semibold">{c.title}</p>
                <p className="mt-2 text-sm text-sky-300">{formatoMXN(c.budget)}</p>
                <p className="mt-1 text-xs text-gray-400">Campaña publicada</p>
              </button>
            ))}
          </section>

          <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-6 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Detalle de campaña
            </p>
            <h2 className="mt-2 text-2xl font-bold">{campana?.title}</h2>

            {campana?.objective && (
              <div className="mt-6">
                <p className="mb-2 text-sm text-sky-300">Objetivo</p>
                <p className="whitespace-pre-wrap text-gray-200">{campana.objective}</p>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-2 text-sm text-sky-300">Brief</p>
              <p className="whitespace-pre-wrap text-gray-200">
                {campana?.description || "Sin brief registrado."}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-slate-700 bg-[#0b1628] p-4">
              <p className="text-sm font-semibold text-white">Entregables solicitados</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                {campana?.deliverables || "Sin entregables registrados."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-700 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-400">Presupuesto</p>
                <p className="mt-1 text-xl font-bold">{formatoMXN(campana?.budget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Fecha límite</p>
                <p className="mt-1 font-semibold">{formatoFecha(campana?.due_date)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-sm text-sky-100">
                Para conectar con la marca, usa la sección que ya existe en IndaSocial.
              </p>
              <Link
                href="/connect"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                Conecta con Marcas
              </Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

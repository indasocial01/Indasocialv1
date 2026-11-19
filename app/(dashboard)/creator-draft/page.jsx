
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

  return new Date(anio, mes - 1, dia).toLocaleDateString(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

const etiquetaEstado = (estado) => {
  switch (estado) {
    case "pending":
      return "Invitación pendiente";
    case "accepted":
      return "Colaboración aceptada";
    case "completed":
      return "Colaboración finalizada";
    default:
      return "Sin estado";
  }
};

export default function CreatorDraftPage() {
  const { currentUser, isAuthReady } = useAuth();
  const [supabase] = useState(() => createClient());

  const [campanas, setCampanas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar exclusivamente las propuestas asignadas al creador
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
        .from("proposals")
        .select(`
          id,
          status,
          campaign:campaigns!campaign_id (
            id,
            title,
            description,
            objective,
            deliverables,
            budget,
            due_date,
            status
          )
        `)
        .eq("creator_id", currentUser.id)
        .in("status", [
          "pending",
          "accepted",
          "completed",
        ])
        .order("created_at", {
          ascending: false,
        });

      if (!activa) return;

      if (consultaError) {
        setError(consultaError.message);
      } else {
        const lista = (data || [])
          .filter((propuesta) => propuesta.campaign)
          .map((propuesta) => ({
            ...propuesta.campaign,
            proposalId: propuesta.id,
            proposalStatus: propuesta.status,
          }));

        setCampanas(lista);
        setSeleccionada(lista[0]?.proposalId || null);
      }

      setCargando(false);
    }

    cargarCampanas();

    return () => {
      activa = false;
    };
  }, [
    currentUser?.id,
    currentUser?.type,
    isAuthReady,
    supabase,
  ]);

  // Responder una invitación enviada por la marca
  const responderPropuesta = async (estado) => {
    const propuesta = campanas.find(
      (c) => c.proposalId === seleccionada
    );

    if (
      !propuesta ||
      propuesta.proposalStatus !== "pending" ||
      !currentUser?.id ||
      procesando
    ) {
      return;
    }

    if (!["accepted", "rejected"].includes(estado)) {
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    const { error: respuestaError } = await supabase
      .from("proposals")
      .update({
        status: estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propuesta.proposalId)
      .eq("creator_id", currentUser.id)
      .eq("status", "pending")
      .select("id")
      .single();

    if (respuestaError) {
      setError(respuestaError.message);
      setProcesando(false);
      return;
    }

    if (estado === "accepted") {
      setCampanas((prev) =>
        prev.map((c) =>
          c.proposalId === propuesta.proposalId
            ? {
                ...c,
                proposalStatus: "accepted",
              }
            : c
        )
      );

      setMensaje("Invitación aceptada correctamente.");
    } else {
      const restantes = campanas.filter(
        (c) => c.proposalId !== propuesta.proposalId
      );

      setCampanas(restantes);
      setSeleccionada(
        restantes[0]?.proposalId || null
      );

      setMensaje("Invitación rechazada.");
    }

    setProcesando(false);
  };

  if (!isAuthReady) {
    return (
      <main className="flex-1 bg-[#080e1b] p-8 text-white">
        Cargando...
      </main>
    );
  }

  if (currentUser?.type !== "creator") {
    return (
      <main className="flex-1 bg-[#080e1b] p-8 text-white">
        Esta vista corresponde a los creadores de contenido.
      </main>
    );
  }

  const campana = campanas.find(
    (c) => c.proposalId === seleccionada
  );

  const pendientes = campanas.filter(
    (c) => c.proposalStatus === "pending"
  ).length;

  const aceptadas = campanas.filter(
    (c) => c.proposalStatus === "accepted"
  ).length;

  return (
    <main className="min-w-0 flex-1 bg-[#080e1b] p-5 text-white md:p-8">

      {/* ENCABEZADO */}
      <header className="mb-8">
        <p className="text-sm font-semibold text-sky-400">
          INDASOCIAL · CREADORES
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Mis colaboraciones
        </h1>

        <p className="mt-2 text-gray-400">
          Consulta tus invitaciones, campañas asignadas
          y colaboraciones con marcas.
        </p>
      </header>

      {/* RESUMEN */}
      <div className="mb-7 grid gap-4 md:grid-cols-2">

        <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-5">
          <p className="text-sm text-sky-300">
            Invitaciones pendientes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {cargando ? "—" : pendientes}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Campañas que requieren tu respuesta
          </p>
        </section>

        <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-5">
          <p className="text-sm text-sky-300">
            Colaboraciones aceptadas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {cargando ? "—" : aceptadas}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Campañas en las que aceptaste participar
          </p>
        </section>

      </div>

      {/* MENSAJES */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          Error: {error}
        </div>
      )}

      {mensaje && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          {mensaje}
        </div>
      )}

      {cargando && (
        <p className="text-gray-300">
          Cargando colaboraciones...
        </p>
      )}

      {/* SIN INVITACIONES */}
      {!cargando && !error && campanas.length === 0 && (
        <div className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-6">
          <h2 className="text-xl font-semibold text-white">
            Aún no tienes invitaciones de campañas
          </h2>

          <p className="mt-2 text-gray-400">
            Cuando una marca con la que hayas hecho match
            te asigne una campaña, aparecerá aquí.
          </p>

          <Link
            href="/connect"
            className="mt-5 inline-block rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500"
          >
            Conecta con Marcas
          </Link>
        </div>
      )}

      {/* CAMPAÑAS ASIGNADAS */}
      {!cargando && !error && campanas.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LISTA DE COLABORACIONES */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              Mis campañas asignadas
            </h2>

            {campanas.map((c) => (
              <button
                key={c.proposalId}
                type="button"
                onClick={() => {
                  setSeleccionada(c.proposalId);
                  setMensaje("");
                }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  seleccionada === c.proposalId
                    ? "border-sky-400 bg-sky-950/70"
                    : "border-slate-700 bg-[#122036] hover:border-sky-600"
                }`}
              >
                <p className="font-semibold">
                  {c.title}
                </p>

                <p className="mt-2 text-sm text-sky-300">
                  {formatoMXN(c.budget)}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {etiquetaEstado(c.proposalStatus)}
                </p>
              </button>
            ))}
          </section>

          {/* DETALLE */}
          <section className="rounded-2xl border border-sky-500/30 bg-[#101e35] p-6 lg:col-span-2">

            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Detalle de colaboración
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {campana?.title}
            </h2>

            <span className="mt-3 inline-block rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
              {etiquetaEstado(campana?.proposalStatus)}
            </span>

            {/* OBJETIVO */}
            {campana?.objective && (
              <div className="mt-6">
                <p className="mb-2 text-sm text-sky-300">
                  Objetivo
                </p>

                <p className="whitespace-pre-wrap text-gray-200">
                  {campana.objective}
                </p>
              </div>
            )}

            {/* BRIEF */}
            <div className="mt-6">
              <p className="mb-2 text-sm text-sky-300">
                Brief
              </p>

              <p className="whitespace-pre-wrap text-gray-200">
                {campana?.description ||
                  "Sin brief registrado."}
              </p>
            </div>

            {/* ENTREGABLES */}
            <div className="mt-6 rounded-xl border border-slate-700 bg-[#0b1628] p-4">
              <p className="text-sm font-semibold text-white">
                Entregables solicitados
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                {campana?.deliverables ||
                  "Sin entregables registrados."}
              </p>
            </div>

            {/* PRESUPUESTO Y FECHA */}
            <div className="mt-6 grid gap-4 border-t border-slate-700 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-400">
                  Presupuesto
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatoMXN(campana?.budget)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Fecha límite
                </p>

                <p className="mt-1 font-semibold">
                  {formatoFecha(campana?.due_date)}
                </p>
              </div>
            </div>

            {/* ACEPTAR O RECHAZAR */}
            {campana?.proposalStatus === "pending" && (
              <div className="mt-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">

                <h3 className="mb-2 font-bold text-white">
                  Invitación de colaboración
                </h3>

                <p className="mb-4 text-sm text-gray-300">
                  Una marca te ha invitado a participar
                  en esta campaña. Revisa los detalles
                  antes de responder.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      responderPropuesta("accepted")
                    }
                    className="rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
                  >
                    {procesando
                      ? "Procesando..."
                      : "Aceptar invitación"}
                  </button>

                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      responderPropuesta("rejected")
                    }
                    className="rounded-lg border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {/* COLABORACIÓN ACEPTADA */}
            {campana?.proposalStatus === "accepted" && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <p className="font-semibold text-emerald-300">
                  Colaboración aceptada
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Ya formas parte de esta campaña.
                  El seguimiento de etapas y los archivos
                  de la colaboración estarán disponibles
                  en esta sección.
                </p>
              </div>
            )}

            {/* FINALIZADA */}
            {campana?.proposalStatus === "completed" && (
              <div className="mt-6 rounded-xl border border-slate-600 bg-slate-800/40 p-5">
                <p className="font-semibold text-gray-200">
                  Colaboración finalizada
                </p>
              </div>
            )}

          </section>
        </div>
      )}
    </main>
  );
}

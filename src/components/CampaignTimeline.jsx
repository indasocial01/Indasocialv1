
"use client";

const etapas = [
  { id: "accepted", nombre: "ACEPTADA" },
  { id: "funded", nombre: "PAGADA" },
  { id: "in_progress", nombre: "EN PROCESO" },
  { id: "delivered", nombre: "ENTREGADA" },
  { id: "approved", nombre: "APROBADA" },
  { id: "paid_out", nombre: "PAGADA AL CREADOR" },
];

const estadosCampana = {
  draft: "Borrador",
  active: "Publicada",
  completed: "Finalizada",
  cancelled: "Cancelada",
};

export default function CampaignTimeline({
  status = "draft",
  deliverables = "",
  collaborationStatus = null,
}) {
  const etapaActual = etapas.findIndex(
    (etapa) => etapa.id === collaborationStatus
  );

  const siguienteEtapa =
    etapaActual < etapas.length - 1
      ? etapas[etapaActual + 1]
      : null;

  let mensaje = "";

  if (status === "draft") {
    mensaje = "La campaña está en borrador. Falta publicarla.";
  } else if (status === "cancelled") {
    mensaje = "La campaña fue cancelada.";
  } else if (collaborationStatus === "paid_out") {
    mensaje = "La colaboración terminó.";
  } else if (etapaActual >= 0) {
    mensaje = `Siguiente etapa: ${siguienteEtapa?.nombre || "Finalizada"}`;
  } else if (status === "active") {
    mensaje =
      "Campaña publicada. Las etapas de colaboración comenzarán cuando se registre una propuesta aceptada.";
  } else {
    mensaje =
      "No hay información detallada del avance de la colaboración.";
  }

  return (
    <section className="rounded-2xl border border-[#34304f] bg-[#111126] p-5 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
            Seguimiento
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Estado de la campaña
          </h2>
        </div>

        <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-200">
          {estadosCampana[status] || status}
        </span>
      </div>

      {/* Timeline horizontal */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {etapas.map((etapa, index) => {
          const completada = etapaActual > index;
          const actual = etapaActual === index;
          const proxima =
            status === "active" &&
            etapaActual + 1 === index;

          return (
            <div
              key={etapa.id}
              className={`flex min-h-[82px] flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-colors ${
                completada
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : actual
                  ? "border-purple-400 bg-[#523b88]"
                  : proxima
                  ? "border-purple-500/70 bg-purple-500/15"
                  : "border-[#37354e] bg-[#18182c]"
              }`}
            >
              <span
                className={`text-lg font-bold ${
                  completada
                    ? "text-emerald-400"
                    : actual || proxima
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {completada ? "✓" : index + 1}
              </span>

              <span
                className={`mt-1 text-[10px] font-bold leading-tight sm:text-xs ${
                  actual || proxima
                    ? "text-white"
                    : completada
                    ? "text-emerald-300"
                    : "text-gray-400"
                }`}
              >
                {etapa.nombre}
              </span>
            </div>
          );
        })}
      </div>

      {/* Información del estado */}
      <div className="mt-5 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-300">
          Próximo paso
        </p>

        <p className="text-sm leading-relaxed text-gray-200">
          {mensaje}
        </p>
      </div>

      {/* Entregables */}
      <div className="mt-6 border-t border-[#34304f] pt-5">
        <h3 className="mb-3 text-base font-bold text-white">
          Entregables
        </h3>

        <div className="rounded-xl border border-[#34304f] bg-[#18182c] p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {deliverables || "Sin entregables registrados."}
          </p>
        </div>
      </div>
    </section>
  );
}

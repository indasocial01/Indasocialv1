"use client";

const etapas = [
  { id: "accepted", nombre: "ACEPTADA" },
 // { id: "funded", nombre: "FONDOS CONFIRMADOS" },
  { id: "in_progress", nombre: "EN PROCESO" },
  { id: "delivered", nombre: "ENTREGADA" },
  { id: "approved", nombre: "APROBADA" },
 // { id: "paid_out", nombre: "PAGO AL CREADOR" },
];

const estadosCampana = {
  draft: "Borrador",
  active: "Publicada",
  completed: "Finalizada",
  cancelled: "Cancelada",
};

const temas = {
  brand: {
    fondo: "bg-[#111126]",
    borde: "border-[#34304f]",
    titulo: "text-purple-400",
    etiqueta: "border-purple-500/40 bg-purple-500/20 text-purple-200",
    actual: "border-purple-400 bg-[#523b88]",
    siguiente: "border-purple-500/70 bg-purple-500/15",
    aviso: "border-purple-500/30 bg-purple-500/10",
    avisoTexto: "text-purple-300",
  },
  creator: {
    fondo: "bg-[#101e35]",
    borde: "border-sky-500/30",
    titulo: "text-sky-400",
    etiqueta: "border-sky-500/40 bg-sky-500/15 text-sky-200",
    actual: "border-sky-400 bg-sky-700/60",
    siguiente: "border-sky-500/70 bg-sky-500/15",
    aviso: "border-sky-500/30 bg-sky-500/10",
    avisoTexto: "text-sky-300",
  },
};

export default function CampaignTimeline({
  status = "draft",
  deliverables = "",
  collaborationStatus = null,
  variant = "brand",
}) {
  const tema = temas[variant] || temas.brand;

  const etapaActual = etapas.findIndex(
    (etapa) => etapa.id === collaborationStatus
  );

  const siguienteEtapa =
    etapaActual >= 0 && etapaActual < etapas.length - 1
      ? etapas[etapaActual + 1]
      : null;

  let mensaje = "";

  if (status === "cancelled") {
    mensaje = "La campaña fue cancelada.";
  } else if (collaborationStatus === "pending") {
    mensaje = "Invitación enviada. Falta que el creador responda.";
  } else if (collaborationStatus === "accepted") {
    mensaje =
      "Colaboración aceptada. Pendiente de documentación y siguientes pasos";
  } else if (collaborationStatus === "funded") {
    mensaje =
      "Fondos confirmados. La colaboración puede comenzar.";
  } else if (collaborationStatus === "paid_out") {
    mensaje = "La colaboración terminó y se registró el pago al creador.";
  } else if (siguienteEtapa) {
    mensaje = `Siguiente etapa: ${siguienteEtapa.nombre}`;
  } else if (status === "draft") {
    mensaje = "La campaña está en borrador. Falta publicarla.";
  } else {
    mensaje =
      "Campaña publicada. Pendiente de una colaboración aceptada.";
  }

  const etiqueta =
    etapaActual >= 0
      ? etapas[etapaActual].nombre
      : collaborationStatus === "pending"
      ? "Invitación pendiente"
      : estadosCampana[status] || "Sin estado";

  return (
    <section
      className={`rounded-2xl border p-5 md:p-6 ${tema.fondo} ${tema.borde}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-widest ${tema.titulo}`}
          >
            Seguimiento
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Estado de la colaboración
          </h2>
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${tema.etiqueta}`}
        >
          {etiqueta}
        </span>
      </div>

      {/* TIMELINE HORIZONTAL */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {etapas.map((etapa, index) => {
          const completada = etapaActual > index;
          const actual = etapaActual === index;
          const proxima =
            etapaActual >= 0 && etapaActual + 1 === index;

          let estilo = "border-[#37354e] bg-[#18182c]";

          if (completada) {
            estilo = "border-emerald-500/50 bg-emerald-500/10";
          } else if (actual) {
            estilo = tema.actual;
          } else if (proxima) {
            estilo = tema.siguiente;
          }

          return (
            <div
              key={etapa.id}
              className={`flex min-h-[82px] flex-col items-center justify-center rounded-xl border px-2 py-3 text-center ${estilo}`}
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

      {/* PRÓXIMO PASO */}
      <div
        className={`mt-5 rounded-xl border p-4 ${tema.aviso}`}
      >
        <p
          className={`mb-1 text-xs font-bold uppercase tracking-wide ${tema.avisoTexto}`}
        >
          Estado actual y próximo paso
        </p>

        <p className="text-sm leading-relaxed text-gray-200">
          {mensaje}
        </p>
      </div>

      {/* ENTREGABLES */}
      <div className={`mt-6 border-t pt-5 ${tema.borde}`}>
        <h3 className="mb-3 text-base font-bold text-white">
          Entregables
        </h3>

        <div
          className={`rounded-xl border bg-[#18182c] p-4 ${tema.borde}`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {deliverables || "Sin entregables registrados."}
          </p>
        </div>
      </div>
    </section>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import CampaignTimeline from "@/src/components/CampaignTimeline";

const formatoMXN = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function CampaignsDraftPage() {
  const { currentUser } = useAuth();
  const [supabase] = useState(() => createClient());

  const [campanas, setCampanas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.id || currentUser.type !== "brand") {
      return;
    }

    async function cargarCampanas() {
      setCargando(true);
      setError("");

      const { data, error } = await supabase
        .from("campaigns")
        .select(
          "id, title, description, budget, status, deliverables"
        )
        .eq("brand_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCampanas(data || []);
        setSeleccionada(data?.[0]?.id || null);
      }

      setCargando(false);
    }

    cargarCampanas();
  }, [currentUser?.id, currentUser?.type, supabase]);

  if (currentUser?.type !== "brand") {
    return (
      <main className="flex-1 p-8 text-white">
        Esta vista corresponde a las marcas.
      </main>
    );
  }

  const campana = campanas.find(
    (c) => c.id === seleccionada
  );

  return (
    <main className="min-w-0 flex-1 bg-[#0b0b16] p-5 text-white md:p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-purple-400">
          INDASOCIAL
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Gestión de campañas
        </h1>

        <p className="mt-2 text-gray-400">
          Consulta tus campañas, entregables y progreso.
        </p>
      </header>

      {cargando && <p>Cargando campañas...</p>}

      {error && (
        <p className="text-red-400">
          Error: {error}
        </p>
      )}

      {!cargando &&
        !error &&
        campanas.length === 0 && (
          <p>No tienes campañas registradas.</p>
        )}

      {!cargando &&
        !error &&
        campanas.length > 0 && (
          <div className="space-y-6">

            {/* TIMELINE HORIZONTAL */}
            {campana && (
              <CampaignTimeline
                status={campana.status}
                deliverables={campana.deliverables}
              />
            )}

            {/* CAMPAÑAS Y DETALLE */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Lista de campañas */}
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">
                  Mis campañas
                </h2>

                {campanas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSeleccionada(c.id)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      seleccionada === c.id
                        ? "border-purple-500 bg-purple-950/40"
                        : "border-gray-700 bg-[#151526]"
                    }`}
                  >
                    <p className="font-semibold">
                      {c.title}
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                      {formatoMXN(c.budget)}
                    </p>
                  </button>
                ))}
              </section>

              {/* Detalle de campaña */}
              <section className="rounded-2xl border border-[#34304f] bg-[#151526] p-6 lg:col-span-2">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  Detalle de campaña
                </p>

                <h2 className="mb-3 text-2xl font-bold">
                  {campana?.title}
                </h2>

                <p className="mb-2 text-sm text-gray-400">
                  Brief
                </p>

                <p className="mb-6 whitespace-pre-wrap text-gray-200">
                  {campana?.description ||
                    "Sin brief registrado."}
                </p>

                <div className="border-t border-[#34304f] pt-5">
                  <p className="text-sm text-gray-400">
                    Presupuesto
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatoMXN(campana?.budget)}
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
    </main>
  );
}

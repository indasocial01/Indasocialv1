
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

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
    if (!currentUser?.id || currentUser.type !== "brand") return;

    async function cargarCampanas() {
      setCargando(true);

      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, budget, status")
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

  const campana = campanas.find((c) => c.id === seleccionada);

  return (
    <main className="flex-1 min-w-0 bg-[#0b0b16] p-8 text-white">
      <header className="mb-8">
        <p className="text-sm text-purple-400">INDASOCIAL</p>
        <h1 className="text-3xl font-bold">Gestión de campañas</h1>
        <p className="mt-2 text-gray-400">
          Administra tus colaboraciones con creadores.
        </p>
      </header>

      {cargando && <p>Cargando campañas...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!cargando && !error && campanas.length === 0 && (
        <p>No tienes campañas registradas.</p>
      )}

      {!cargando && !error && campanas.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Mis campañas</h2>

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
                <p className="font-semibold">{c.title}</p>
                <p className="mt-2 text-sm text-gray-400">
                  {formatoMXN(c.budget)}
                </p>
              </button>
            ))}
          </section>

          <section className="rounded-2xl border border-gray-700 bg-[#151526] p-6 lg:col-span-2">
            <p className="mb-2 text-sm text-purple-400">
              Detalle de campaña
            </p>

            <h2 className="mb-5 text-2xl font-bold">
              {campana?.title}
            </h2>

            <p className="mb-2 text-sm text-gray-400">Brief</p>
            <p className="mb-6 whitespace-pre-wrap">
              {campana?.description || "Sin brief registrado."}
            </p>

            <div className="border-t border-gray-700 pt-5">
              <p className="text-sm text-gray-400">Presupuesto</p>
              <p className="text-2xl font-bold">
                {formatoMXN(campana?.budget)}
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Estado: {campana?.status || "Sin estado"}
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

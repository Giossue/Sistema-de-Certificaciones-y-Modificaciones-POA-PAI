import { useCallback, useEffect, useMemo, useState } from "react";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { useAuth } from "@/features/auth/use-auth";
import { TramiteDetail } from "./components/tramite-detail";
import { TramitesMetrics } from "./components/tramites-metrics";
import { TramitesWorkPanel } from "./components/tramites-work-panel";
import {
  ejecutarAccionTramite,
  listarTramites,
} from "./services/tramites-api";
import type {
  SortDirection,
  SortKey,
  Tramite,
  TramitesMessage,
} from "./types";
import { preferredFilterOrder } from "./utils/tramites-helpers";

export function TramitesPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("poa_token");
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [selected, setSelected] = useState<Tramite | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("todos");
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [message, setMessage] = useState<TramitesMessage | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const payload = await listarTramites({
        page,
        pageSize,
        sortKey,
        sortDirection,
        estado,
        query: debouncedQuery,
      });
      if (payload) {
        setTramites(payload.items);
        setTotalItems(payload.totalItems);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, estado, page, pageSize, sortDirection, sortKey, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const bandejaRol = useMemo(() => {
    const rol = user?.rol || "";
    if (rol === "unidad")
      return "Mis solicitudes, observadas, devueltas y saldos por corregir";
    if (rol === "analista")
      return "Por revisar, observadas y listas para aprobación";
    if (rol === "director") return "Por suscribir, aprobar y resolver";
    if (rol === "financiero")
      return "Certificaciones emitidas, uso, liquidaciones y devoluciones";
    if (rol === "bienes") return "Discrepancias que disparan modificación POA";
    return "Bandeja institucional completa";
  }, [user?.rol]);

  const estados = useMemo(
    () =>
      preferredFilterOrder
        .map((option) => option.value)
        .filter((value) => value !== "todos"),
    [],
  );

  const estadoOptions = useMemo(() => {
    const preferred = preferredFilterOrder.filter(
      (option) => option.value === "todos" || estados.includes(option.value),
    );
    return preferred;
  }, [estados]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginados = tramites;
  const userRole = user?.rol || "";

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, estado, pageSize, sortDirection, sortKey]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const postAction = async (
    item: Tramite,
    action: string,
    body?: Record<string, unknown>,
  ) => {
    if (!token) return;
    const response = await ejecutarAccionTramite(item, action, body);
    if (!response) return;
    const { res, data } = response;
    if (!res.ok) {
      setMessage({
        type: "error",
        text: data.error || "No se pudo ejecutar la acción",
      });
      return;
    }
    setMessage({ type: "ok", text: "Trámite actualizado" });
    setSelected(null);
    await cargar();
  };

  const handleSort = (key: string) => {
    const typedKey = key as SortKey;
    if (sortKey === typedKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(typedKey);
    setSortDirection(["fecha", "monto"].includes(typedKey) ? "desc" : "asc");
  };

  return (
    <div className="p-6">
      <PageHeader title="Bandeja de Trámites" description={bandejaRol} />
      {message && (
        <InlineMessage tone={message.type === "ok" ? "success" : "danger"}>
          {message.text}
        </InlineMessage>
      )}
      <TramitesMetrics tramites={tramites} />
      <TramitesWorkPanel
        query={query}
        setQuery={setQuery}
        estado={estado}
        setEstado={setEstado}
        estadoOptions={estadoOptions}
        totalItems={totalItems}
        loading={loading}
        pageSize={pageSize}
        sortKey={sortKey}
        sortDirection={sortDirection}
        handleSort={handleSort}
        paginados={paginados}
        userRole={userRole}
        setSelected={setSelected}
        postAction={postAction}
        page={page}
        totalPages={totalPages}
        setPageSize={setPageSize}
        setPage={setPage}
      />
      {selected && (
        <TramiteDetail
          selected={selected}
          userRole={userRole}
          onClose={() => setSelected(null)}
          postAction={postAction}
        />
      )}
    </div>
  );
}

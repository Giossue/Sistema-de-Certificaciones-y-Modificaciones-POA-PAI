import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/app-ui";
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
  const [pendingAction, setPendingAction] = useState<{
    item: Tramite;
    action: string;
  } | null>(null);

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
    if (!token) return false;
    const response = await ejecutarAccionTramite(item, action, body);
    if (!response) return false;
    const { res, data } = response;
    if (!res.ok) {
      setMessage({
        type: "error",
        text: data.error || "No se pudo ejecutar la acción",
      });
      return false;
    }
    setMessage({ type: "ok", text: "Trámite actualizado" });
    setSelected(null);
    await cargar();
    return true;
  };

  const requestAction = (item: Tramite, action: string) => {
    setPendingAction({ item, action });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    const ok = await postAction(pendingAction.item, pendingAction.action);
    if (ok) setPendingAction(null);
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
        postAction={requestAction}
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
          postAction={requestAction}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? confirmActionTitle(pendingAction.action) : ""}
        description={
          pendingAction
            ? confirmActionDescription(
                pendingAction.item,
                pendingAction.action,
              )
            : undefined
        }
        confirmText={pendingAction ? confirmActionText(pendingAction.action) : "Confirmar"}
        cancelText="Cancelar"
        tone={pendingAction?.action === "aplicar" ? "warning" : "info"}
        onConfirm={confirmPendingAction}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}

function confirmActionTitle(action: string) {
  const labels: Record<string, string> = {
    aprobar: "Confirmar aprobación",
    suscribir: "Confirmar suscripción",
    aplicar: "Confirmar aplicación",
    "marcar-uso": "Confirmar uso",
    reenviar: "Confirmar reenvío",
  };
  return labels[action] || "Confirmar acción";
}

function confirmActionText(action: string) {
  const labels: Record<string, string> = {
    aprobar: "Aprobar",
    suscribir: "Suscribir",
    aplicar: "Aplicar",
    "marcar-uso": "Marcar uso",
    reenviar: "Reenviar",
  };
  return labels[action] || "Confirmar";
}

function confirmActionDescription(item: Tramite, action: string) {
  const actionCopy: Record<string, string> = {
    aprobar: "aprobar este trámite y avanzar su flujo",
    suscribir: "suscribir este trámite",
    aplicar: "aplicar este trámite y registrar sus efectos",
    "marcar-uso": "marcar esta certificación como en uso",
    reenviar: "reenviar este trámite para continuar su revisión",
  };
  return `Está por ${actionCopy[action] || "ejecutar esta acción"}: ${item.numero}. Revise que el trámite y el estado sean correctos antes de continuar.`;
}

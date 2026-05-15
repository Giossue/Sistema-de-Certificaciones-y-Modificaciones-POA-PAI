import { useCallback, useEffect, useState } from "react";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { ConfirmDialog, ObservationDialog } from "@/components/app-ui";
import { useAuth } from "@/features/auth/use-auth";
import { AnulacionForm } from "./components/anulacion-form";
import { AnulacionesTable } from "./components/anulaciones-table";
import {
  aprobarAnulacion,
  cargarCertificacionesAnulacion,
  crearAnulacion,
  listarAnulaciones,
  rechazarAnulacion,
} from "./services/anulaciones-api";
import type { Anulacion, Certificacion } from "./types";

export function AnulacionesPage() {
  const { user } = useAuth();
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [anulaciones, setAnulaciones] = useState<Anulacion[]>([]);
  const [certificacionId, setCertificacionId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("poa_token");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAnulaciones, setTotalAnulaciones] = useState(0);
  const [rechazoId, setRechazoId] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [rechazando, setRechazando] = useState(false);
  const [aprobacionId, setAprobacionId] = useState<string | null>(null);
  const [aprobando, setAprobando] = useState(false);
  const [solicitudConfirmOpen, setSolicitudConfirmOpen] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    const [certs, anulacionesPayload] = await Promise.all([
      cargarCertificacionesAnulacion(),
      listarAnulaciones({ page: currentPage, pageSize }),
    ]);
    setCertificaciones(certs);
    if (anulacionesPayload) {
      setAnulaciones(anulacionesPayload.items);
      setTotalAnulaciones(anulacionesPayload.totalItems);
    }
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalPages = Math.max(1, Math.ceil(totalAnulaciones / pageSize));

  const enviar = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    const { res, data } = await crearAnulacion({ certificacionId, motivo });
    setLoading(false);
    if (!res.ok) setMessage(data.error || "No se pudo anular");
    else {
      setMessage("Anulación solicitada");
      setMotivo("");
      await cargar();
    }
  };

  const ejecutarAprobacion = async () => {
    if (!token) return;
    if (!aprobacionId) return;
    setAprobando(true);
    try {
      const { res, data } = await aprobarAnulacion(aprobacionId);
      if (!res.ok) setMessage(data.error || "No se pudo aprobar");
      else {
        setMessage("Anulación aprobada");
        setAprobacionId(null);
        await cargar();
      }
    } finally {
      setAprobando(false);
    }
  };

  const aprobar = async (id: string) => {
    if (!token) return;
    setAprobacionId(id);
  };

  const ejecutarRechazo = async () => {
    if (!token) return;
    if (!rechazoId || !motivoRechazo.trim()) return;
    setRechazando(true);
    try {
      const { res, data } = await rechazarAnulacion(rechazoId, motivoRechazo);
      if (!res.ok) setMessage(data.error || "No se pudo rechazar");
      else {
        setMessage("Anulación rechazada");
        setRechazoId(null);
        setMotivoRechazo("");
        await cargar();
      }
    } finally {
      setRechazando(false);
    }
  };

  const rechazar = async (id: string) => {
    if (!token) return;
    setMotivoRechazo("");
    setRechazoId(id);
  };

  const canApprove = ["admin", "director"].includes(user?.rol || "");

  return (
    <div className="p-6">
      <PageHeader
        title="Anulaciones"
        description="Solicitud y aprobación de cancelación de certificaciones sin uso"
      />
      {message && <InlineMessage>{message}</InlineMessage>}
      <div className="space-y-6">
        <AnulacionForm
          certificaciones={certificaciones}
          certificacionId={certificacionId}
          setCertificacionId={setCertificacionId}
          motivo={motivo}
          setMotivo={setMotivo}
          loading={loading}
          onEnviar={() => setSolicitudConfirmOpen(true)}
        />
        <AnulacionesTable
          anulaciones={anulaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          totalAnulaciones={totalAnulaciones}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
          canApprove={canApprove}
          onAprobar={aprobar}
          onRechazar={rechazar}
        />
      </div>
      <ObservationDialog
        open={Boolean(rechazoId)}
        title="Rechazar anulación"
        description="Ingrese el motivo de rechazo para continuar."
        label="Motivo de rechazo"
        placeholder="Detalle el motivo"
        value={motivoRechazo}
        onChange={setMotivoRechazo}
        required
        tone="danger"
        confirmText="Rechazar"
        loading={rechazando}
        onConfirm={ejecutarRechazo}
        onClose={() => {
          if (!rechazando) setRechazoId(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(aprobacionId)}
        title="Confirmar aprobación"
        description="Está por aprobar esta solicitud de anulación. Revise que la certificación y el motivo sean correctos antes de continuar."
        confirmText="Aprobar"
        cancelText="Cancelar"
        tone="warning"
        loading={aprobando}
        onConfirm={ejecutarAprobacion}
        onClose={() => {
          if (!aprobando) setAprobacionId(null);
        }}
      />
      <ConfirmDialog
        open={solicitudConfirmOpen}
        title="Solicitar anulación"
        description="Está por solicitar una anulación. Revise certificación y motivo antes de continuar."
        confirmText="Solicitar anulación"
        cancelText="Cancelar"
        tone="warning"
        loading={loading}
        onConfirm={async () => {
          await enviar();
          setSolicitudConfirmOpen(false);
        }}
        onClose={() => {
          if (!loading) setSolicitudConfirmOpen(false);
        }}
      />
    </div>
  );
}

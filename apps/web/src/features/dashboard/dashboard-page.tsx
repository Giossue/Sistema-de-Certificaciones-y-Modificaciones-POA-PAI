import { Card, CardBody, CardHeader } from "@heroui/react";
import { useAuth } from "@/features/auth/use-auth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Panel Principal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm text-slate-500">Bienvenido</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">{user?.nombre}</p>
            <p className="text-sm text-slate-500 capitalize">{user?.rol}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm text-slate-500">Certificaciones</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">0</p>
            <p className="text-sm text-slate-500">Pendientes</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm text-slate-500">Saldos</p>
          </CardHeader>
          <CardBody>
            <p className="text-lg font-semibold">—</p>
            <p className="text-sm text-slate-500">Disponible</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Accesos rápidos</h2>
        </CardHeader>
        <CardBody className="text-sm text-slate-600">
          <ul className="list-disc list-inside space-y-1">
            <li>Solicitar nueva certificación</li>
            <li>Consultar saldos por actividad</li>
            <li>Ver certificaciones emitidas</li>
            <li>Administrar usuarios</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

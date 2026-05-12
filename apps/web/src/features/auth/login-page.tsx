import { useState } from "react";
import { Card, CardContent, Button, Spinner } from "@heroui/react";
import { useAuth } from "./use-auth";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="inline-block w-20 h-20 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Sistema POA/PAI</h1>
          <p className="text-sm text-white/70 mt-1">Universidad Estatal de Bolivar</p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo electronico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-primary transition-colors"
                  placeholder="correo@institucion.edu.ec"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-primary transition-colors"
                  placeholder="********"
                />
              </div>
              {error && (
                <p className="text-sm text-danger bg-danger-soft border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary text-white font-medium py-2.5 rounded-md transition-colors"
                isDisabled={loading}
              >
                {loading ? <Spinner size="sm" className="text-white" /> : "Iniciar sesion"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/70 text-xs mt-6">
          Direccion de Planificacion y Estrategica
        </p>
      </div>
    </div>
  );
}

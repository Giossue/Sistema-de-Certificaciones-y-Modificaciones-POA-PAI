import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Spinner } from "@heroui/react";
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
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-[#0033a0]">Sistema POA/PAI</h1>
          <p className="text-sm text-slate-500">Inicia sesión para continuar</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-danger-500">{error}</p>
            )}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Iniciar sesión"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

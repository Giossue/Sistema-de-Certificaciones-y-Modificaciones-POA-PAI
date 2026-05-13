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
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <img src="/assets/logo.png" alt="Logo" className="auth-logo" />
          <h1 className="auth-title">Sistema POA/PAI</h1>
          <p className="auth-subtitle">Universidad Estatal de Bolívar</p>
        </div>

        <Card className="auth-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="auth-form">
              <div>
                <label className="app-field-label">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="app-field-input"
                  placeholder="correo@institucion.edu.ec"
                />
              </div>
              <div>
                <label className="app-field-label">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="app-field-input"
                  placeholder="********"
                />
              </div>
              {error && <p className="app-error-message">{error}</p>}
              <Button
                type="submit"
                className="app-submit-button"
                isDisabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="auth-footer">Dirección de Planificación Estratégica</p>
      </div>
    </div>
  );
}

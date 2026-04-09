import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { login } from "../features/auth/api";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authQuery = useAuthSession();
  const [email, setEmail] = useState("demo@la-roca.local");
  const [password, setPassword] = useState("Demo1234!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const search = new URLSearchParams(location.search);
  const next = search.get("next") ?? "/app/configurator/1";

  if (authQuery.data) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      navigate(next, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">La Roca</p>
        <h1>Acceso al configurador</h1>
        <p className="login-card__copy">
          Entra con tus credenciales propias para abrir la línea de cotización en una pestaña segura.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>

          {error ? (
            <p className="error-banner" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        <p className="login-card__footnote">
          Credenciales locales de prueba: <strong>demo@la-roca.local / Demo1234!</strong>
        </p>
      </section>
    </main>
  );
}

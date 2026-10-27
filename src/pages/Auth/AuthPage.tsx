import { Gauge, LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register";

export function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <p>Cargando Control Auto...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/resumen" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !email.trim() ||
      !password ||
      (mode === "register" && !fullName.trim())
    ) {
      setError("Completá todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);

    if (mode === "register") {
      const result = await signUp(
        email.trim(),
        password,
        fullName.trim(),
      );

      if (result.error) {
        setError(result.error);
      } else if (result.requiresConfirmation) {
        setMessage(
          "Cuenta creada. Revisá tu correo para confirmar el registro.",
        );
      }
    } else {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError("Correo o contraseña incorrectos.");
      }
    }

    setSubmitting(false);
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <Gauge size={30} />
          </div>

          <div>
            <h1>Control Auto</h1>
            <p>Todos los datos de tu vehículo en un solo lugar.</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Crear cuenta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="form-field">
              <span>Nombre</span>

              <input
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
              />
            </label>
          )}

          <label className="form-field">
            <span>Correo electrónico</span>

            <input
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>

<div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    required
    autoComplete={mode === "login" ? "current-password" : "new-password"}
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword((current) => !current)}
    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>
          </label>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={submitting}
          >
            {mode === "login" ? (
              <LogIn size={19} />
            ) : (
              <UserPlus size={19} />
            )}

            {submitting
              ? "Procesando..."
              : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>
        </form>
      </section>
    </main>
  );
}
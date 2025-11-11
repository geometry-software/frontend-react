import React from "react"
import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useRouteError,
} from "react-router-dom"
import "./index.css"

import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import AppPage from "./pages/AppPage"
import RequireAuth from "./components/RequireAuth"

function isAuthed() {
  return !!localStorage.getItem("auth:token")
}

function IndexGate() {
  return isAuthed() ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
}

function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-muted-foreground">Página no encontrada</p>
        <a className="underline" href="/login">Ir al login</a>
      </div>
    </div>
  )
}

function RouteErrorBoundary() {
  const err = useRouteError() as any
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">Ocurrió un error</h1>
        <p className="text-muted-foreground">
          {err?.statusText || err?.message || "Algo salió mal"}
        </p>
        <a className="underline" href="/">Volver al inicio</a>
      </div>
    </div>
  )
}

const router = createBrowserRouter(
  [
    { path: "/", element: <IndexGate /> },
    {
      path: "/app",
      element: (
        <RequireAuth>
          <AppPage />
        </RequireAuth>
      ),
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "*", element: <NotFound /> },
  ],
  { errorElement: <RouteErrorBoundary /> }
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

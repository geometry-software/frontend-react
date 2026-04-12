import React from "react"
import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useRouteError,
} from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.css"

import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import AppPage from "./pages/AppPage"
import ProductsPage from "./pages/ProductsPage"
import ShippingPage from "./pages/ShippingPage"
import UsersPage from "./pages/UsersPage"
import ProfilePage from "./pages/ProfilePage"
import RequireAuth from "./components/RequireAuth"

function isAuthed() {
  return !!localStorage.getItem("auth:token")
}

function IndexGate() {
  return isAuthed()
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />
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

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <IndexGate /> },
      {
        path: "dashboard",
        element: (
          <RequireAuth>
            <AppPage />
          </RequireAuth>
        ),
      },
      {
        path: "products",
        element: (
          <RequireAuth>
            <ProductsPage />
          </RequireAuth>
        ),
      },
      {
        path: "shipping",
        element: (
          <RequireAuth>
            <ShippingPage />
          </RequireAuth>
        ),
      },
      {
        path: "users",
        element: (
          <RequireAuth>
            <UsersPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
)
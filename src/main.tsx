
import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"

import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import RequireAuth from "./components/RequireAuth"

function AppPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">Bienvenido 🎉</h1>
        <p className="text-muted-foreground">Sesión iniciada contra la API real.</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppPage />
      </RequireAuth>
    ),
  },
  // Auth
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

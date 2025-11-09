import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import "./index.css"

function Home() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Credenciales de prueba</h1>
      <p className="text-sm opacity-80">
        Usa: admin@example.com / <b>admin123</b> — user@example.com / <b>user12345</b>
      </p>
      <div className="flex gap-4">
        <Link className="underline" to="/login">Login</Link>
        <Link className="underline" to="/signup">Sign up</Link>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

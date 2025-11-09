
import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { apiGetMe } from "../lib/api-auth"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<null | boolean>(null)
  const location = useLocation()
  useEffect(() => {
    apiGetMe().then(()=>setOk(true)).catch(()=>setOk(false))
  }, [])
  if (ok === null) return null
  if (!ok) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

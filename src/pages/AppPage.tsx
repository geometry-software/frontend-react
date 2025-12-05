import DashboardLayout from "../components/dashboard-layout"

export default function AppPage() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Bienvenido 🎉</h1>
          <p className="text-muted-foreground">
            a SevenFox
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

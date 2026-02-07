import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function ServerErrorPage() {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-6xl font-bold text-muted-foreground/20">500</h1>
          <div className="mt-4 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Sunucu Hatası
            </h2>
            <p className="text-sm text-muted-foreground">
              Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>
      </div>
    </div>
  )
}

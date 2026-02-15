import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { redirect, useLoaderData, useRevalidator } from "react-router-dom"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { pageService } from "@/services/page"
import { apiKeyService, type ManagedAPIKey } from "@/services/api-key"
import { useAppStore, useAuthStore } from "@/stores"

interface LoaderData {
  pageData: any
  apiKeys: ManagedAPIKey[]
}

export const loader = async () => {
  await useAppStore.getState().init()

  try {
    await useAuthStore.getState().checkSession()
  } catch {
    return redirect("/login")
  }

  const currentUser = useAuthStore.getState().user
  if (!currentUser || (currentUser.role || "").toLowerCase() !== "admin") {
    return redirect("/403")
  }

  try {
    const [pageData, apiKeys] = await Promise.all([
      pageService.fetchPage("api-settings"),
      apiKeyService.list(),
    ])

    return {
      pageData,
      apiKeys,
    } satisfies LoaderData
  } catch (error: any) {
    const status = error.response?.status || 500
    const message = error.response?.data?.error || error.response?.data?.message || error.message || "API ayarları yüklenemedi"

    throw new Response(message, {
      status,
      statusText: error.response?.statusText,
    })
  }
}

function toRFC3339(localValue: string): string | undefined {
  if (!localValue) {
    return undefined
  }
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
}

function formatDate(value?: string): string {
  if (!value) {
    return "-"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" {
  if (status === "revoked") {
    return "destructive"
  }
  if (status === "expired") {
    return "secondary"
  }
  return "default"
}

export default function APISettingsPage() {
  const { pageData, apiKeys } = useLoaderData() as LoaderData
  const revalidator = useRevalidator()

  const [name, setName] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [lastCreatedKey, setLastCreatedKey] = useState("")

  const docsEndpoints = {
    openapi: "/api/openapi.json",
    swagger: "/api/docs",
  }

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        throw new Error("Key name is required")
      }
      return apiKeyService.create({
        name: trimmedName,
        expires_at: toRFC3339(expiresAt),
      })
    },
    onSuccess: (response) => {
      setLastCreatedKey(response.key)
      setName("")
      setExpiresAt("")
      toast.success("API key oluşturuldu")
      revalidator.revalidate()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "API key oluşturulamadı"
      toast.error(message)
    },
  })

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: number) => apiKeyService.revoke(id),
    onSuccess: () => {
      toast.success("API key revoke edildi")
      revalidator.revalidate()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "API key revoke edilemedi"
      toast.error(message)
    },
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pageData.title}</h1>
        {pageData.description && (
          <p className="text-sm text-muted-foreground mt-1">{pageData.description}</p>
        )}
      </div>

      <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openapi-spec-url">OpenAPI Spec</Label>
            <div className="flex gap-2">
              <Input id="openapi-spec-url" readOnly value={docsEndpoints.openapi} />
              <Button asChild variant="secondary">
                <a href={docsEndpoints.openapi} target="_blank" rel="noreferrer">Aç</a>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="swagger-url">Swagger UI</Label>
            <div className="flex gap-2">
              <Input id="swagger-url" readOnly value={docsEndpoints.swagger} />
              <Button asChild>
                <a href={docsEndpoints.swagger} target="_blank" rel="noreferrer">Aç</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Managed API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            OpenAI benzeri bir şekilde birden fazla key oluşturabilir, listeleyebilir ve revoke edebilirsiniz.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto] items-end">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">Key Name</Label>
            <Input
              id="api-key-name"
              placeholder="CI/CD Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key-expiry">Expires At</Label>
            <Input
              id="api-key-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <Button
            onClick={() => createKeyMutation.mutate()}
            disabled={createKeyMutation.isPending || !name.trim()}
          >
            Key Oluştur
          </Button>
        </div>

        {lastCreatedKey && (
          <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-medium">Yeni API key (yalnızca bir kez gösterilir)</p>
            <code className="mt-2 block rounded bg-background p-2 text-xs break-all">{lastCreatedKey}</code>
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(lastCreatedKey)
                    toast.success("API key panoya kopyalandı")
                  } catch {
                    toast.error("Panoya kopyalanamadı")
                  }
                }}
              >
                Kopyala
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Henüz API key oluşturulmadı.
                  </TableCell>
                </TableRow>
              )}
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell className="font-mono text-xs">{key.prefix}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(key.status)}>{key.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(key.created_at)}</TableCell>
                  <TableCell>{formatDate(key.last_used_at)}</TableCell>
                  <TableCell>{formatDate(key.expires_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={key.status === "revoked" || revokeKeyMutation.isPending}
                      onClick={() => revokeKeyMutation.mutate(key.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

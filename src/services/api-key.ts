import api from "@/lib/axios"

export interface ManagedAPIKey {
  id: number
  name: string
  prefix: string
  created_by_user_id?: number
  last_used_at?: string
  expires_at?: string
  revoked_at?: string
  status: "active" | "expired" | "revoked"
  created_at: string
  updated_at: string
}

interface ManagedAPIKeyListResponse {
  data: ManagedAPIKey[]
}

interface ManagedAPIKeyCreateResponse {
  data: ManagedAPIKey
  key: string
}

interface ManagedAPIKeyRevokeResponse {
  data: ManagedAPIKey
}

export const apiKeyService = {
  async list(): Promise<ManagedAPIKey[]> {
    const { data } = await api.get<ManagedAPIKeyListResponse>("/api-keys")
    return data.data || []
  },

  async create(input: { name: string; expires_at?: string }): Promise<ManagedAPIKeyCreateResponse> {
    const { data } = await api.post<ManagedAPIKeyCreateResponse>("/api-keys", input)
    return data
  },

  async revoke(id: number): Promise<ManagedAPIKeyRevokeResponse> {
    const { data } = await api.delete<ManagedAPIKeyRevokeResponse>(`/api-keys/${id}`)
    return data
  },
}

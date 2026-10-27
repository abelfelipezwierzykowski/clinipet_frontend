const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export class ApiError extends Error {
  status?: number
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const error = new ApiError(body?.message || `A API respondeu com o status ${response.status}.`)
      error.status = response.status
      throw error
    }
    if (response.status === 204) return undefined as T
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Não foi possível conectar ao backend. Verifique se a API está disponível.')
  }
}

export const api = {
  list: (resource: string) => request<Record<string, unknown>[]>(resource),
  get: (resource: string, id: number) => request<Record<string, unknown>>(`${resource}/${id}`),
  create: (resource: string, data: Record<string, unknown>) => request(resource, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource: string, id: number, data: Record<string, unknown>) => request(`${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (resource: string, id: number) => request(`${resource}/${id}`, { method: 'DELETE' }),
}

/**
 * API Client - Base fetch wrapper for client-side API calls
 * Used by TanStack Query hooks to call API routes
 */

export type ApiResponse<T> = {
  status: number
  message?: string
  data?: T
} & T

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return baseUrl
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options

  const finalUrl = buildUrl(url, params)

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies for auth
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(finalUrl, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status
    )
  }

  return response.json()
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    request<T>(url, { method: "GET", params }),

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body }),

  delete: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "DELETE", body }),
}

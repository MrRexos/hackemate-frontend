type ApiClientOptions = RequestInit & {
  baseUrl?: string
}

export async function apiClient<TResponse>(
  endpoint: string,
  { baseUrl = import.meta.env.VITE_API_URL ?? '', headers, ...options }: ApiClientOptions = {},
) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<TResponse>
}

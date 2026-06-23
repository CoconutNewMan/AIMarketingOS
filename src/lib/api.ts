const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

export async function callFunction<T>(
  name: string,
  body: Record<string, unknown>,
  token: string
): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Function call failed')
  }

  return res.json()
}

export async function callAdmin<T>(
  path: string,
  method: string,
  token: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/admin/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Admin call failed')
  }

  return res.json()
}

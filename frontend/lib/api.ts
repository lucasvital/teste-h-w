
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

const DUPLICATE_MSG =
  'Já existem dados na tabela. Clique em Limpar e, em seguida, em Executar novamente.'

function isN8nDbErrorInBody(json: { data?: unknown }): boolean {
  const d = json?.data && typeof json.data === 'object' ? (json.data as { success?: boolean; code?: string; data?: unknown }) : null
  if (!d) return false
  if (d.success === false && d.code === 'DB_ERROR') return true
  const inner = d.data && typeof d.data === 'object' ? (d.data as { success?: boolean; code?: string }) : null
  return !!(inner && inner.success === false && inner.code === 'DB_ERROR')
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
}

export async function getUsers(): Promise<{
  success: boolean
  data?: User[]
  error?: string
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'GET',
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`)
    const json = await res.json()
    return { success: true, data: json.data ?? [] }
  } catch (e) {
    return {
      success: false,
      data: [],
      error: e instanceof Error ? e.message : 'Erro ao buscar usuários',
    }
  }
}

export async function executeFlow(): Promise<{
  success: boolean
  message?: string
  error?: string
  code?: string
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/fetch-and-decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const json = (await res.json().catch(() => ({}))) as {
      error?: string
      message?: string
      code?: string
      data?: unknown
    }
    if (!res.ok) {
      throw new Error(json.error ?? `Erro HTTP: ${res.status}`)
    }
    if (isN8nDbErrorInBody(json)) {
      return { success: false, error: DUPLICATE_MSG }
    }
    return {
      success: true,
      message: json.message ?? 'Dados processados com sucesso! Aguardando salvamento...',
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erro ao processar dados',
    }
  }
}

export async function clearData(): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? `Erro HTTP: ${res.status}`)
    }
    const json = await res.json()
    return {
      success: true,
      message: (json as { message?: string }).message ?? 'Dados limpos com sucesso!',
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erro desconhecido ao limpar dados',
    }
  }
}

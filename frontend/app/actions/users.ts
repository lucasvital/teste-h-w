'use server'

/**
 * Server Actions para comunicação com o backend Node.js
 * 
 * O "use server" marca este arquivo para executar apenas no servidor.
 * Isso mantém as credenciais e lógica seguras, sem expor ao cliente.
 */

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Server Action: getUsers
 * Busca usuários já salvos no PostgreSQL
 */
export async function getUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  try {
    console.log('[Server Action] Buscando usuários do banco...');
    
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Server Action] Usuários recebidos:', result.data?.length);

    return {
      success: true,
      data: result.data || []
    };

  } catch (error) {
    console.error('[Server Action] Erro ao buscar usuários:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro ao buscar usuários'
    };
  }
}

/**
 * Server Action: executeFlow
 * 
 * Fluxo:
 * 1. Chama backend POST /api/fetch-and-decrypt
 * 2. Backend busca dados criptografados
 * 3. Backend descriptografa com AES-256-GCM
 * 4. Backend envia para N8N
 * 5. N8N salva no PostgreSQL e retorna dados
 * 6. Retorna dados para o frontend
 */
export async function executeFlow(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    console.log('[Server Action] Executando fluxo de dados...');
    
    const response = await fetch(`${BACKEND_URL}/api/fetch-and-decrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    console.log('[Server Action] Fluxo executado com sucesso');

    return {
      success: true,
      message: result.message || 'Dados processados com sucesso! Aguardando salvamento...'
    };

  } catch (error) {
    console.error('[Server Action] Erro ao executar fluxo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao processar dados'
    };
  }
}

/**
 * Server Action: clearData
 * 
 * Fluxo:
 * 1. Chama backend POST /api/clear
 * 2. Backend chama webhook N8N para TRUNCATE
 * 3. N8N limpa tabela users no PostgreSQL
 * 4. Retorna confirmação
 */
export async function clearData(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    console.log('[Server Action] Limpando dados...');
    
    const response = await fetch(`${BACKEND_URL}/api/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    
    console.log('[Server Action] Dados limpos:', result);

    return {
      success: true,
      message: result.message || 'Dados limpos com sucesso!'
    };

  } catch (error) {
    console.error('[Server Action] Erro ao limpar dados:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao limpar dados'
    };
  }
}


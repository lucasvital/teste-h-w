# N8N Integration App

Aplicação fullstack desenvolvida com **Next.js**, **Node.js**, **N8N** e **PostgreSQL** para demonstrar integração de dados com descriptografia AES-256-GCM, automação de workflows e persistência em banco de dados.

## 🏗️ Arquitetura

```
Frontend (Next.js + Server Actions)
    ↓ HTTP
Backend Node.js (Express)
    ↓ HTTP
N8N Webhooks
    ↓ SQL
PostgreSQL
```

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (Componentes)
- **Server Actions** ("use server")

### Backend
- **Node.js**
- **Express**
- **AES-256-GCM** (Descriptografia nativa)
- **Axios**

### Automação & Banco de Dados
- **N8N** (Workflows e Webhooks)
- **PostgreSQL**

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Conta N8N (Cloud ou auto-hospedado)
- Banco de dados PostgreSQL (pode usar N8N Cloud Database)

---

## 🔧 Instalação

### 1. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd <nome-do-projeto>
```

### 2. Instalar Dependências

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

## ⚙️ Configuração

### Backend

1. Criar arquivo `.env` na pasta `backend/`:

```env
PORT=3001

# Endpoint com dados criptografados (fornecido pela H&W)
ENCRYPTED_DATA_URL=https://n8n-apps.n8nlshealth.com/webhook/data-5dYBr/SlMlVJxfmco

# URL do webhook N8N para salvar dados (configurar no próximo passo)
N8N_WEBHOOK_SAVE_URL=https://seu-n8n.app/webhook/save-users

# URL do webhook N8N para limpar dados (configurar no próximo passo)
N8N_WEBHOOK_CLEAR_URL=https://seu-n8n.app/webhook/clear-users
```

### Frontend

1. Criar arquivo `.env.local` na pasta `frontend/`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## 🔐 Configuração do N8N

### Criar Banco de Dados PostgreSQL

Se você usa N8N Cloud, pode criar um banco PostgreSQL gratuito em:
- [Supabase](https://supabase.com/) (gratuito)
- [Neon](https://neon.tech/) (gratuito)
- [Railway](https://railway.app/) (gratuito)

Crie a tabela `users`:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL
);
```

### Workflow 1: Salvar Dados (save-users)

1. Acesse seu N8N
2. Crie um novo workflow
3. Adicione os seguintes nós:

#### Nó 1: Webhook (Trigger)
- **Method**: POST
- **Path**: `save-users`
- **Response Mode**: "Last Node"

#### Nó 2: Code (Processar dados)
```javascript
// Extrair array de usuários do body
const users = $input.item.json.users || [];

// Retornar cada usuário como item separado
return users.map(user => ({
  json: {
    name: user.name,
    email: user.email,
    phone: user.phone
  }
}));
```

#### Nó 3: Postgres (Inserir dados)
- **Operation**: Insert
- **Table**: `users`
- **Columns**: name, email, phone
- **Options**: 
  - "Return All": ✅
  - "Continue On Fail": ✅

#### Nó 4: Aggregate (Coletar resultados)
- **Aggregate**: "Aggregate all items"

#### Nó 5: Respond to Webhook
- **Response Code**: 200
- **Response Body**: 
```json
{
  "success": true,
  "users": {{ $json }}
}
```

5. **Ativar o workflow** e copiar a URL do webhook
6. Adicionar a URL no `.env` do backend como `N8N_WEBHOOK_SAVE_URL`

### Workflow 2: Limpar Dados (clear-users)

1. Crie um novo workflow
2. Adicione os seguintes nós:

#### Nó 1: Webhook (Trigger)
- **Method**: POST
- **Path**: `clear-users`
- **Response Mode**: "Last Node"

#### Nó 2: Postgres (Executar Query)
- **Operation**: Execute Query
- **Query**: `TRUNCATE TABLE users RESTART IDENTITY;`

#### Nó 3: Respond to Webhook
- **Response Code**: 200
- **Response Body**:
```json
{
  "success": true,
  "message": "Tabela users limpa com sucesso"
}
```

3. **Ativar o workflow** e copiar a URL do webhook
4. Adicionar a URL no `.env` do backend como `N8N_WEBHOOK_CLEAR_URL`

---

## 🏃 Executar Localmente

### 1. Iniciar Backend

```bash
cd backend
npm start
```

O backend estará rodando em `http://localhost:3001`

### 2. Iniciar Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 3. Testar a Aplicação

1. Abra `http://localhost:3000` no navegador
2. Clique em **"Executar"** para buscar e descriptografar dados
3. Os dados serão exibidos na tabela
4. Clique em **"Limpar"** para limpar a tabela

---

## 📊 Fluxo de Dados

### Botão "Executar"

1. **Frontend** chama Server Action `executeFlow()`
2. **Server Action** faz POST para backend `/api/fetch-and-decrypt`
3. **Backend** busca dados criptografados de:
   ```
   https://n8n-apps.n8nlshealth.com/webhook/data-5dYBr/SlMlVJxfmco
   ```
4. **Backend** descriptografa com AES-256-GCM usando:
   - IV (Vetor de Inicialização)
   - Key (Chave Secreta)
   - Auth Tag (Tag de Autenticação)
5. **Backend** envia dados descriptografados para webhook N8N
6. **N8N** salva dados no PostgreSQL
7. **N8N** retorna dados salvos
8. **Frontend** atualiza tabela dinamicamente (sem reload)

### Botão "Limpar"

1. **Frontend** chama Server Action `clearData()`
2. **Server Action** faz POST para backend `/api/clear`
3. **Backend** chama webhook N8N de limpeza
4. **N8N** executa `TRUNCATE TABLE users`
5. **Frontend** limpa tabela (array vazio)

---

## 🚢 Deploy

### Deploy do Backend

Recomendamos **Railway**, **Render** ou **Heroku**:

#### Railway (Recomendado)

1. Crie conta em [railway.app](https://railway.app/)
2. Clique em "New Project" → "Deploy from GitHub"
3. Selecione o repositório
4. Configure as variáveis de ambiente:
   ```
   PORT=3001
   ENCRYPTED_DATA_URL=https://n8n-apps.n8nlshealth.com/webhook/data-5dYBr/SlMlVJxfmco
   N8N_WEBHOOK_SAVE_URL=<sua-url-n8n>
   N8N_WEBHOOK_CLEAR_URL=<sua-url-n8n>
   ```
5. Railway detectará automaticamente o Node.js
6. Configure Root Directory como `backend`
7. Copie a URL gerada

#### Render

1. Crie conta em [render.com](https://render.com/)
2. "New" → "Web Service"
3. Conecte o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Adicione variáveis de ambiente
6. Deploy

### Deploy do Frontend

Recomendamos **Vercel** (otimizado para Next.js):

#### Vercel (Recomendado)

1. Crie conta em [vercel.com](https://vercel.com/)
2. Clique em "New Project"
3. Importe o repositório
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Adicione variável de ambiente:
   ```
   NEXT_PUBLIC_BACKEND_URL=<url-do-backend-no-railway>
   ```
6. Deploy
7. Copie a URL gerada

#### Netlify (Alternativa)

1. Crie conta em [netlify.com](https://netlify.com/)
2. "Add new site" → "Import from Git"
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
4. Adicione variáveis de ambiente
5. Deploy

---

## 🔍 Testando a API Diretamente

### Health Check

```bash
curl http://localhost:3001/health
```

### Executar Fluxo

```bash
curl -X POST http://localhost:3001/api/fetch-and-decrypt
```

### Limpar Dados

```bash
curl -X POST http://localhost:3001/api/clear
```

---

## 🎨 Estrutura do Projeto

```
.
├── backend/
│   ├── server.js              # Servidor Express
│   ├── utils/
│   │   └── crypto.js          # Descriptografia AES-256-GCM
│   ├── package.json
│   └── .env                   # Variáveis de ambiente
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Layout root
│   │   ├── page.tsx           # Página principal
│   │   ├── globals.css        # Estilos globais
│   │   └── actions/
│   │       └── users.ts       # Server Actions ('use server')
│   ├── components/
│   │   └── ui/                # Componentes Shadcn
│   ├── lib/
│   │   └── utils.ts           # Utilitários
│   ├── package.json
│   └── .env.local             # Variáveis de ambiente
│
└── README.md
```

---

## 💡 Explicação: "use server"

A diretiva **"use server"** é uma feature do Next.js 13+ (App Router) que permite criar **Server Actions**:

### O que faz:
- Marca funções para executarem **apenas no servidor**
- Permite chamadas diretas do cliente sem criar rotas API manualmente
- Mantém credenciais e lógica sensível seguras (não expõe ao cliente)
- Gerencia serialização e comunicação automaticamente

### Exemplo:

```typescript
'use server'

export async function minhaFuncao() {
  const apiKey = process.env.SECRET_KEY; // Seguro! Nunca vai pro cliente
  const dados = await fetch('https://api.com', {
    headers: { 'Authorization': apiKey }
  });
  return dados.json();
}
```

### No cliente:

```typescript
'use client'

import { minhaFuncao } from './actions'

export default function Page() {
  async function handleClick() {
    const dados = await minhaFuncao(); // Chamada do cliente → servidor
  }
  return <button onClick={handleClick}>Buscar</button>
}
```

### Vantagens:
- ✅ Menos código (sem rotas API manuais)
- ✅ Type-safe (TypeScript end-to-end)
- ✅ Seguro (credenciais no servidor)
- ✅ Simples de usar

---

## 🐛 Troubleshooting

### Backend não conecta ao N8N

- Verifique se as URLs dos webhooks estão corretas no `.env`
- Confirme que os workflows N8N estão **ativados**
- Teste os webhooks diretamente com cURL

### Erro de CORS

- Verifique se o backend tem `cors()` configurado
- Confirme a URL do backend no frontend (`.env.local`)

### Dados não aparecem na tabela

- Verifique se o PostgreSQL está acessível
- Confirme que a tabela `users` existe
- Veja os logs do N8N para erros

### Erro de descriptografia

- O endpoint fornecido deve retornar:
  - `encryptedData` (ou `encrypted` ou `data`)
  - `iv` (Vetor de Inicialização)
  - `key` (ou `secretKey`)
  - Opcionalmente: `authTag` (ou `tag`)

---

## 📝 Notas Importantes

1. **Segurança**: Nunca commitar arquivos `.env` com credenciais reais
2. **N8N Cloud**: A versão gratuita tem limites de execuções mensais
3. **PostgreSQL**: Use conexões SSL em produção
4. **Rate Limiting**: Considere adicionar rate limiting no backend para produção

---

## 📄 Licença

MIT

---

## 👨‍💻 Desenvolvedor

Desenvolvido para o teste técnico da **Health & Wellness**

**Stack**: Next.js • Node.js • N8N • PostgreSQL • AES-256-GCM


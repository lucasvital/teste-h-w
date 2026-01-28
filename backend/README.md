# Backend - N8N Integration

API Node.js/Express para descriptografia AES-256-GCM e integração com N8N.

## 🚀 Funcionalidades

- **Descriptografia AES-256-GCM** de dados criptografados
- **Integração com N8N** via webhooks
- **Endpoints RESTful** para frontend
- **CORS** configurado
- **Logging** detalhado

## 📋 Endpoints

### GET /health

Health check do servidor.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend N8N Integration está rodando!"
}
```

### POST /api/fetch-and-decrypt

Busca dados criptografados, descriptografa e envia para N8N.

**Fluxo:**
1. Busca dados do endpoint H&W
2. Descriptografa com AES-256-GCM
3. Envia para N8N webhook
4. N8N salva no PostgreSQL
5. Retorna dados salvos

**Response (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+55 11 98888-8888"
    }
  ],
  "message": "Dados descriptografados, salvos no PostgreSQL via N8N"
}
```

**Response (erro):**
```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes técnicos"
}
```

### POST /api/clear

Limpa a tabela users via N8N.

**Fluxo:**
1. Chama webhook N8N de limpeza
2. N8N executa TRUNCATE TABLE users
3. Retorna confirmação

**Response:**
```json
{
  "success": true,
  "message": "Tabela users limpa com sucesso"
}
```

## 🔐 Descriptografia AES-256-GCM

O módulo `utils/crypto.js` implementa descriptografia AES-256-GCM usando a biblioteca nativa `crypto` do Node.js.

### Formato Esperado

O endpoint criptografado deve retornar:

```json
{
  "encryptedData": "base64_encoded_data...",
  "iv": "initialization_vector",
  "key": "secret_key",
  "authTag": "authentication_tag" // opcional
}
```

### Algoritmo

1. Converte key, IV e authTag de base64/hex para Buffer
2. Cria decipher com algoritmo `aes-256-gcm`
3. Define authTag para verificar integridade
4. Descriptografa os dados
5. Retorna JSON parseado

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Crypto** (nativo) - Descriptografia AES-256-GCM
- **Axios** - Cliente HTTP
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Gerenciamento de variáveis de ambiente

## ⚙️ Variáveis de Ambiente

Crie `.env` na raiz do backend:

```env
PORT=3001
ENCRYPTED_DATA_URL=https://n8n-apps.n8nlshealth.com/webhook/data-5dYBr/SlMlVJxfmco
N8N_WEBHOOK_SAVE_URL=https://seu-n8n.app/webhook/save-users
N8N_WEBHOOK_CLEAR_URL=https://seu-n8n.app/webhook/clear-users
```

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

### Desenvolvimento
```bash
npm start
```

### Produção
```bash
NODE_ENV=production npm start
```

## 🧪 Testar

### Health Check
```bash
curl http://localhost:3001/health
```

### Fetch and Decrypt
```bash
curl -X POST http://localhost:3001/api/fetch-and-decrypt \
  -H "Content-Type: application/json"
```

### Clear Data
```bash
curl -X POST http://localhost:3001/api/clear \
  -H "Content-Type: application/json"
```

## 📁 Estrutura

```
backend/
├── server.js           # Servidor Express principal
├── utils/
│   └── crypto.js       # Módulo de descriptografia
├── package.json
├── .env                # Variáveis de ambiente (não commitar)
├── .gitignore
└── README.md
```

## 🔒 Segurança

- ✅ CORS configurado
- ✅ Variáveis de ambiente para credenciais
- ✅ Descriptografia segura com AES-256-GCM
- ✅ Validação de auth tag (integridade)
- ⚠️ Para produção, adicione:
  - Rate limiting
  - Autenticação/Authorization
  - Logging de segurança
  - HTTPS

## 🐛 Troubleshooting

### Erro: "N8N_WEBHOOK_SAVE_URL não configurada"

Configure a variável no `.env`:
```env
N8N_WEBHOOK_SAVE_URL=https://seu-n8n.app/webhook/save-users
```

### Erro: "Falha ao descriptografar dados"

Verifique:
1. O endpoint retorna IV, key e dados criptografados corretos
2. Os formatos são base64 ou hex válidos
3. A auth tag está presente (se não estiver no encryptedData)

### Erro: "Connection refused" ao N8N

Verifique:
1. URL do webhook está correta
2. Workflow N8N está ativado
3. Teste o webhook diretamente com cURL

## 📚 Recursos

- [Crypto Node.js Docs](https://nodejs.org/api/crypto.html)
- [Express Docs](https://expressjs.com/)
- [AES-GCM Explanation](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

## 📝 Licença

MIT


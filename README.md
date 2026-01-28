Teste técnico H&W

Comecei consultado o endpoint da API no Insomnia para entender como era retornada a resposta da consulta, baseado nisso comecei a planejar o plano para descriptografar os dados usando a biblioteca Crypto, usei os dados retornados em hexadecimal transformando os mesmos em buffer, pois o crypto precisa processar eles em bytes. Feito isso consegui sucesso.

A partir deste ponto tratei a resposta enviando para meu N8N, onde eu recebi os dados, usei um node code para normalizar e transformar em array e subi para o Postgres.

O frontend fiz uma tabela responsiva, qu e ao carregar a página consulta o endpoint da API na rota GET, que da um SELECT em todos ids, preenchendo a tabela.

1. Frontend solicita execução → Backend
2. Backend busca dados criptografados da H&W API
3. Descriptografa usando crypto nativo do Node.js
4. Envia dados para webhook do N8N
5. N8N normaliza e salva no PostgreSQL (Railway)
6. Frontend consulta e exibe com paginação



Instalação

### Backend
cd backend
npm install
cp .env.example .env  
npm run dev

.env
PORT=3001
ENCRYPTED_DATA_URL=https://...
N8N_WEBHOOK_SAVE_URL=https://...
N8N_WEBHOOK_CLEAR_URL=https://...
DATABASE_URL=postgresql://...


### Frontend
cd frontend
npm install
cp .env.example .env
npm run dev

.env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

Rotas da API
**GET** `/api/users`
- Retorna todos os usuários do banco
- Response: `{ success: true, data: User[] }`

**POST** `/api/fetch-and-decrypt`
- Busca dados da H&W, descriptografa e envia para N8N
- Response: `{ success: true, message: string }`

**POST** `/api/clear`
- Limpa todos os dados via webhook N8N
- Response: `{ success: true, message: string }`

**GET** `/health`
- Health check do servidor
- Response: `{ status: 'ok' }`
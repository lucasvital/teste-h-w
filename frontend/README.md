# Frontend - N8N Integration

Interface web Next.js para visualizar e gerenciar dados de usuários com integração N8N.

## 🚀 Funcionalidades

- **Server Actions** (`'use server'`) para comunicação segura com backend
- **Tabela dinâmica** de usuários com atualização sem reload
- **Design responsivo** (mobile, tablet, desktop)
- **Shadcn/ui** componentes modernos
- **Tailwind CSS** para estilização
- **TypeScript** para type safety

## 🎨 Interface

### Componentes Principais

1. **Botão "Executar"**
   - Busca e descriptografa dados
   - Envia para N8N
   - Atualiza tabela automaticamente
   - Loading state visual

2. **Botão "Limpar"**
   - Limpa dados do PostgreSQL via N8N
   - Limpa tabela na interface
   - Confirmação visual

3. **Tabela de Usuários**
   - Colunas: ID, Nome, Email, Telefone
   - Scroll horizontal em mobile
   - Hover effects
   - Estado vazio com mensagem

4. **Mensagens de Feedback**
   - Sucesso (verde)
   - Erro (vermelho)
   - Auto-dismiss
   - Ícones informativos

## 🔐 Server Actions

O arquivo `app/actions/users.ts` usa a diretiva `'use server'` do Next.js 14+.

### O que é "use server"?

É uma diretiva que marca funções para executarem **apenas no servidor**:

✅ **Vantagens:**
- Credenciais seguras (nunca enviadas ao cliente)
- Sem rotas API manuais
- Type-safe (TypeScript end-to-end)
- Serialização automática

### Funções Disponíveis

#### `executeFlow()`

```typescript
'use server'

export async function executeFlow(): Promise<{
  success: boolean;
  data?: User[];
  message?: string;
  error?: string;
}> {
  // Chama backend POST /api/fetch-and-decrypt
  // Retorna dados dos usuários
}
```

#### `clearData()`

```typescript
'use server'

export async function clearData(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  // Chama backend POST /api/clear
  // Retorna confirmação
}
```

### Uso no Componente

```typescript
'use client'

import { executeFlow } from './actions/users'

export default function Page() {
  const [users, setUsers] = useState([]);
  
  const handleExecute = async () => {
    const result = await executeFlow(); // Chamada cliente → servidor
    if (result.success) {
      setUsers(result.data);
    }
  };
  
  return <button onClick={handleExecute}>Executar</button>
}
```

## 🎨 Design System

### Cores (Tailwind)

- **Primary**: Blue-600
- **Success**: Green-600
- **Error**: Red-600
- **Background**: Slate-50/100
- **Text**: Slate-900/600

### Componentes Shadcn

- `Button` - Botões com variantes
- `Card` - Cartões para agrupamento
- `Table` - Tabela responsiva
- **Icons** (lucide-react):
  - `Database` - Ícone principal
  - `Play` - Executar
  - `Trash2` - Limpar
  - `Loader2` - Loading (animado)
  - `CheckCircle2` - Sucesso
  - `XCircle` - Erro

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptações

- Botões: Stack vertical em mobile, horizontal em desktop
- Tabela: Scroll horizontal em mobile
- Cards: Padding ajustado por tela
- Texto: Tamanhos responsivos

## 🛠️ Tecnologias

- **Next.js 14** - Framework React (App Router)
- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utility-first
- **Shadcn/ui** - Componentes acessíveis
- **Lucide React** - Ícones

## ⚙️ Variáveis de Ambiente

Crie `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Nota**: Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser.

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

### Desenvolvimento (com hot reload)
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Rodar Build de Produção
```bash
npm start
```

### Linter
```bash
npm run lint
```

## 📁 Estrutura

```
frontend/
├── app/
│   ├── layout.tsx          # Layout root
│   ├── page.tsx            # Página principal (Client Component)
│   ├── globals.css         # Estilos globais + Tailwind
│   └── actions/
│       └── users.ts        # Server Actions ('use server')
├── components/
│   └── ui/
│       ├── button.tsx      # Componente Button
│       ├── card.tsx        # Componente Card
│       └── table.tsx       # Componente Table
├── lib/
│   └── utils.ts            # Utilitários (cn helper)
├── public/                 # Arquivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .env.local             # Variáveis de ambiente (não commitar)
└── README.md
```

## 🎯 Fluxo de Dados

```
Usuário clica "Executar"
    ↓
handleExecute() (Client)
    ↓
executeFlow() (Server Action)
    ↓
POST http://localhost:3001/api/fetch-and-decrypt
    ↓
Backend descriptografa e envia para N8N
    ↓
N8N salva no PostgreSQL
    ↓
Retorna dados
    ↓
setUsers(data) atualiza estado
    ↓
Tabela re-renderiza dinamicamente
```

## 🧪 Testar

### Testar Localmente

1. Inicie o backend primeiro:
   ```bash
   cd backend && npm start
   ```

2. Inicie o frontend:
   ```bash
   cd frontend && npm run dev
   ```

3. Acesse: http://localhost:3000

4. Clique em "Executar" e verifique se dados aparecem

### Testar Responsividade

1. Abra DevTools (F12)
2. Ative modo responsivo (Ctrl+Shift+M)
3. Teste em diferentes resoluções:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

## 🔒 Segurança

- ✅ Server Actions (código sensível no servidor)
- ✅ TypeScript (type safety)
- ✅ Variáveis de ambiente para URLs
- ✅ Sanitização de inputs (React automático)
- ⚠️ Para produção, adicione:
  - Rate limiting
  - CSRF protection (built-in no Next.js)
  - Content Security Policy
  - Input validation adicional

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

Verifique:
1. Backend está rodando (http://localhost:3001/health)
2. URL no `.env.local` está correta
3. CORS configurado no backend

### Tabela não atualiza

Verifique:
1. Console do browser para erros
2. Response da API no Network tab
3. Estado `users` no React DevTools

### Estilos não carregam

Verifique:
1. Tailwind configurado (`tailwind.config.ts`)
2. CSS importado no `layout.tsx`
3. PostCSS configurado

### TypeScript errors

```bash
# Limpar e recompilar
rm -rf .next
npm run build
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🎨 Customização

### Mudar cores

Edite `app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%; /* HSL color */
}
```

### Adicionar componente Shadcn

```bash
npx shadcn-ui@latest add [component-name]
```

### Mudar fonte

Edite `app/layout.tsx`:

```typescript
import { Roboto } from 'next/font/google'

const roboto = Roboto({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})
```

## 📝 Licença

MIT


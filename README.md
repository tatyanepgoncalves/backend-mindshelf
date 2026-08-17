# 📚 Folhear API — Backend Service

> Backend de alta performance para o **Folhear**, um sistema de gestão para bibliotecas comunitárias focado em facilidade de uso, organização do acervo e ponte entre leitores e voluntários.

---

## 🛠️ Tech Stack & Ferramentas

- **Runtime & Framework:** Node.js + [Fastify](https://fastify.dev/)
- **Linguagem:** TypeScript
- **Banco de Dados & ORM:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)
- **Validação de Schemas:** [Zod](https://zod.dev/)
- **Autenticação:** JWT (`@fastify/jwt`) + Bcrypt / Argon2
- **Linter & Formatter:** [Biome](https://biomejs.dev/)
- **Integrações Externas:** [BrasilAPI](https://brasilapi.com.br/) / Open Library API (Busca por ISBN)

---

## 📐 Arquitetura & Estrutura de Pastas

O projeto adota uma arquitetura modular baseada em rotas, controllers, serviços e middlewares, mantendo acoplamento baixo e alta testabilidade:

```bash
src/
├── @types/               # Definições de tipos globais do Fastify e JWT
├── config/               # Variáveis de ambiente (env.ts via Zod)
├── controllers/          # Lógica de recebimento de requisições
├── db/                   # Conexão com o PostgreSQL e schemas Drizzle
│   ├── migrations/       # Arquivos SQL das tabelas 
│   ├── schema/           # Schemas das tabelas (users, books, loans, reservations)
│   └── connection.ts     # Instância do Drizzle ORM
├── middlewares/          # Filtros de autenticação e permissões.
├── routes/               # Módulos de rotas Fastify (auth, books, loans, etc.)
├── schemas/              # Schemas de validação das rotas
├── services/             # Regras de negócio e integração com APIs externas
└── app.ts                # Ponto de entrada 
└── server.ts             # Boot do servidor Fastify
```

---

## Principais Recursos & Endpoints

### Autenticação (`/api/v1/auth`)

- `POST /auth/register` — Cadastro de leitores e usuários da comunidade
- `POST /auth/login` — Autenticação e emissão do JWT
- `GET /auth/me` — Obter dados do usuário logado

### Acervo (`/api/v1/books`)

- `GET /books` — Listagem paginada de livros com busca e filtros
- `GET /books/:id` — Detalhes completos do livro e localização na biblioteca
- `GET /books/lookup-isbn/:isbn` — Consulta automática de metadados via BrasilAPI/OpenLibrary
- `POST /books` — Cadastro de novos obras/exemplares (*Restrito a Voluntários/Admins*)
- `PUT /books/:id` — Atualização de metadados do livro (*Restrito a Voluntários/Admins*)

### Circulação e Empréstimos (`/api/v1/loans`)

- `GET /loans` — Listagem e monitoramento de empréstimos
- `POST /loans` — Registro de novo empréstimo (valida disponibilidade e pendências do leitor)
- `PATCH /loans/:id/return` — Registro de devolução e atualização do saldo de exemplares

### Reservas (`/api/v1/reservations`)

- `POST /reservations` — Entrada em fila de espera para livros atualmente indisponíveis
- `PATCH /reservations/:id/cancel` — Cancelamento de reserva por leitor ou admin

### Painel Administrativo (`/api/v1/dashboard`)

- `GET /dashboard/stats` — Métricas consolidadas (livros cadastrados, empréstimos ativos, atrasos e leitores)

---

## Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js 20+ ou pnpm/bun
- PostgreSQL rodando via Docker ou banco gerenciado (Supabase / Neon)

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/tatyanepgoncalves/backend-folhear.git
cd backend-folhear
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/folhear_db"
JWT_SECRET="seu-jwt-secret-super-seguro"
PORT=3333
NODE_ENV="development"
DB_TZ="ADD_TZ"
DB_TIMEZONE="ADD_TIMEZONE"
```

### 3. Rodar as migrações do banco de dados (Drizzle)

```bash
npx drizzle-kit push
```

### 4. Iniciar o servidor em ambiente de desenvolvimento

```bash
npm run dev ## ou pnpm dev
```

A API estará acessível em `http://localhost:3333`.

---

## Qualidade de Código & Linter

O projeto utiliza **Biome** para linting e formatação rápida de código:

```bash
# Verificar erros e padrão de código
npx @biomejs/biome check .

# Aplicar correções automáticas
npx @biomejs/biome check --write .
```

---

## Licença

Este projeto é de código aberto sob a licença [MIT](./LICENSE).

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`).
3. Comite suas mudanças (`git commit -m 'Add NovaFeature'`).
4. Faça o push para a branch (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

---
Desenvolvido por **Tatyane Gonçalves**.

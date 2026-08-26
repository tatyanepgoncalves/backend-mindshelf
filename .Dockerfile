# Imagem base
FROM node:20-slim

# Instalação do cliente PostgreSQL e OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /src

# Instalar dependências primeiro (aproveita o cache do Docker)
COPY package*.json ./
RUN npm install

# Copiar o código do projeto inteiro (incluindo a pasta de migrações)
COPY . .

# Compilar TypeScript para JavaScript
RUN npm run build

# Expor a porta (Railway usa a variável PORT)
EXPOSE 3333

# O comando definitivo: Aplica as tabelas ao banco e depois inicia a aplicação
CMD ["sh", "-c", "npm run db:push && npm run start"]
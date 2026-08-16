import { pgEnum } from "drizzle-orm/pg-core"

export const roleEnum= pgEnum('role_enum', ['LEITOR', 'ADMIN', 'VOLUNTARIO'])

export const loansStatusEnum = pgEnum("loans_status", [
  "ATIVO", // Empréstimo em andamento dentro do prazo 
  "ATRASADO", // Empréstimo com data de devolução expirada 
  "DEVOLVIDO", // Livro de devolução à biblioteca 
  "CANCELADO", // Empréstimo cancelado por inconsistência
])

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDENTE", // Aguardando na fila de espera 
  "NOTIFICADO", // Livro ficou disponível e o leitor foi notificado 
  "CUMPRIDO", // Reserva convertida em empréstimo 
  "EXPIRADO", // Prazo de retirada expirou após notificação 
  "CANCELADO", // Cancelada pelo leitor ou administrador
])
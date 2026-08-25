CREATE TYPE "public"."loans_status" AS ENUM('ATIVO', 'ATRASADO', 'DEVOLVIDO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('PENDENTE', 'NOTIFICADO', 'CUMPRIDO', 'EXPIRADO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('LEITOR', 'ADMIN', 'VOLUNTARIO');--> statement-breakpoint
CREATE TABLE "authTokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "authTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"author" text NOT NULL,
	"publisher" text,
	"year" integer,
	"synopsis" text,
	"cover_url" text,
	"isbn" text,
	"location_library" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "books_slug_unique" UNIQUE("slug"),
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "books_to_genres" (
	"book_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	CONSTRAINT "books_to_genres_book_id_genre_id_pk" PRIMARY KEY("book_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "literary_genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "literary_genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "loans_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"status" "loans_status" DEFAULT 'ATIVO' NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"return_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"reader_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'PENDENTE' NOT NULL,
	"reservation_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"notified_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"password" text NOT NULL,
	"slug" text NOT NULL,
	"image" text,
	"role" "role_enum" DEFAULT 'LEITOR' NOT NULL,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "authTokens" ADD CONSTRAINT "authTokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books_to_genres" ADD CONSTRAINT "books_to_genres_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books_to_genres" ADD CONSTRAINT "books_to_genres_genre_id_literary_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."literary_genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans_items" ADD CONSTRAINT "loans_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans_items" ADD CONSTRAINT "loans_items_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_reader_id_users_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_reader_id_users_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
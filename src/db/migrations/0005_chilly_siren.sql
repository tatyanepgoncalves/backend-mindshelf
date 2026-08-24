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
ALTER TABLE "loans" DROP CONSTRAINT "loans_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "loans_items" ADD CONSTRAINT "loans_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans_items" ADD CONSTRAINT "loans_items_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" DROP COLUMN "book_id";--> statement-breakpoint
ALTER TABLE "loans" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "loans" DROP COLUMN "due_date";--> statement-breakpoint
ALTER TABLE "loans" DROP COLUMN "return_date";
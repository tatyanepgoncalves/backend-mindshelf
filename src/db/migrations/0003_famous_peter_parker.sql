ALTER TABLE "books" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_slug_unique" UNIQUE("slug");
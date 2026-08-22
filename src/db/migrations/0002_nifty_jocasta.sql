CREATE TABLE "books_to_genres" (
	"book_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	CONSTRAINT "books_to_genres_book_id_genre_id_pk" PRIMARY KEY("book_id","genre_id")
);
--> statement-breakpoint
ALTER TABLE "books" DROP CONSTRAINT "books_literary_genre_id_literary_genres_id_fk";
--> statement-breakpoint
ALTER TABLE "books_to_genres" ADD CONSTRAINT "books_to_genres_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books_to_genres" ADD CONSTRAINT "books_to_genres_genre_id_literary_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."literary_genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "literary_genre_id";
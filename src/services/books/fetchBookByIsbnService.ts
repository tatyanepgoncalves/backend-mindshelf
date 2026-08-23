import axios from 'axios'

export interface ExternalBookResponse {
  author: string
  coverUrl: string | null
  isbn: string
  publisher: string 
  synopsis: string 
  title: string
  year: string
}

export class IsbnNotFoundError extends Error {
  constructor() {
    super('Livro não encontrado para o ISBN informado.')
  }
}

// Resoluções dos lints de Regex e Destructuring/Complexity
const NON_DIGITS_REGEX = /\D/g
const FOUR_DIGITS_REGEX = /\d{4}/

interface OpenLibraryAuthor {
  name: string
}

export class FetchBookByIsbnService {
  async execute(isbnRaw: string): Promise<ExternalBookResponse> {
    const isbn = isbnRaw.replace(NON_DIGITS_REGEX, '')

    const brasilApiData = await this.fetchFromBrasilApi(isbn)
    if (brasilApiData) {
      return brasilApiData
    }

    const openLibraryData = await this.fetchFromOpenLibrary(isbn)
    if (openLibraryData) {
      return openLibraryData
    }

    throw new IsbnNotFoundError()
  }

  private async fetchFromBrasilApi(
    isbn: string
  ): Promise<ExternalBookResponse | null> {
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/isbn/v1/${isbn}`,
        { validateStatus: (status) => status < 500 }
      )

      if (response.status === 200) {
        const { title, authors, publisher, year, synopsis, cover_url } =
          response.data

        return {
          author: Array.isArray(authors) ? authors.join(', ') : '',
          coverUrl: cover_url ?? null,
          isbn,
          publisher: publisher,
          synopsis: synopsis ?? null,
          title: title ?? '',
          year,
        }
      }
    } catch {
      // Falha de rede/timeout
    }

    return null
  }

  private async fetchFromOpenLibrary(
    isbn: string
  ): Promise<ExternalBookResponse | null> {
    try {
      const response = await axios.get(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
        { validateStatus: (status) => status < 500 }
      )

      if (response.status === 200) {
        const bookKey = `ISBN:${isbn}`
        const bookData = response.data[bookKey]

        if (bookData) {
          const { title, authors, publishers, publish_date, notes, cover } =
            bookData

          const formattedAuthors = authors
            ? authors.map((a: OpenLibraryAuthor) => a.name).join(', ')
            : ''

          const publisher = publishers?.[0]?.name ?? null
          const year = publish_date
            ? (publish_date.match(FOUR_DIGITS_REGEX)?.[0] ?? null)
            : null

          return {
            author: formattedAuthors,
            coverUrl: cover?.medium ?? null,
            isbn,
            publisher,
            synopsis: typeof notes === 'string' ? notes : 'string',
            title: title ?? '',
            year,
          }
        }
      }
    } catch {
      // Ignora e retorna null
    }

    return null
  }
}

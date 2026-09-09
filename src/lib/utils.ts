// Formata strings para (99) 99999-9999 ou (99) 9999-9999
export const formatPhone = (value: string | null | undefined) => {
  if (!value) {
    return ''
  }

  // Remove tudo o que não for número
  const digits = value.replace(/\D/g, '')

  // Limita a 11 dígitos
  const truncated = digits.slice(0, 11)

  if (truncated.length <= 10) {
    // Formato Fixo: (11) 4444-4444
    // biome-ignore lint/performance/useTopLevelRegex: it's necessary
    return truncated.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  // Formato Celular: (11) 9 9999-9999
  // biome-ignore lint/performance/useTopLevelRegex: it's necessary
  return truncated.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
}

// Formata objetos Date ou strings ISO para DD/MM/AAAA
export const formatDate = (
  date: Date | string | null | undefined,
  includeTime = false
) => {
  if (!date) {
    return ''
  }

  let d: Date

  if (typeof date === 'string') {
    const normalized = date.includes('T') ? date : date.replace(' ', 'T')
    d = new Date(normalized)
  } else {
    d = date
  }

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.hour12 = false
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(d)
}

export const formatRelativeTime = (dateParam: Date | string) => {
  let date: Date

  if (typeof dateParam === 'string') {
    // Normaliza espaços de datas em formato SQL (ex: "2026-08-07 08:49:00")
    const normalized = dateParam.includes('T')
      ? dateParam
      : dateParam.replace(' ', 'T')
    date = new Date(normalized)
  } else {
    date = dateParam
  }

  // Diferença em milissegundos a partir do momento atual
  const diffInMs = Date.now() - date.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMins / 60)

  // Menos de 1 minuto
  if (diffInMins < 1) {
    return 'Agora mesmo'
  }

  // 1 minuto
  if (diffInMins === 1) {
    return 'Há 1 min'
  }

  // Menos de 60 minutos
  if (diffInMins < 60) {
    return `Há ${diffInMins} mins`
  }

  // Menos de 24 horas
  if (diffInHours < 24) {
    return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }

  // Passou de 24 horas: retorna a data completa com horário (ex: 07/08/2026)
  return formatDate(date)
}

export function generateSlug(text: string): string {
  return text
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
}

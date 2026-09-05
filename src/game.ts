export type MediaType = 'text' | 'image' | 'audio' | 'video'
export interface Content { type: MediaType; value: string }
export interface Clue {
  points: number
  dailyDouble: boolean
  answer: Content
  question: Content
}
export interface Category { name: string; clues: Clue[] }
export interface Round { name: string; categories: Category[] }
export interface Player { name: string; score: number }
export interface Cell { category: number; clue: number }
export interface Match {
  players: Player[]
  activePlayer: number
  // 0 = available, 1–6 = winner, 7 = nobody answered.
  board: number[][]
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseContent(item: Record<string, unknown>, side: 'answer' | 'question', label: string): Content {
  const type = item[`${side}_type`]
  const value = item[side]
  if (!['text', 'image', 'audio', 'video'].includes(String(type)) || typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label}: contenuto o tipo di ${side} non valido.`)
  }
  if (type !== 'text') {
    const url = new URL(value, 'https://esc-jeopardy.local/')
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`${label}: indirizzo multimediale non valido.`)
  }
  return { type: type as MediaType, value }
}

export function parseRound(input: unknown, name = 'Partita'): Round {
  if (!isRecord(input)) throw new Error('Il file deve contenere un oggetto con le categorie.')
  const keys = Object.keys(input).sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)))
  if (!keys.length || keys.length > 12 || keys.some((key, index) => key !== `category${index + 1}`)) {
    throw new Error('Usa da 1 a 12 categorie consecutive: category1, category2, …')
  }
  let rows = 0
  const categories = keys.map(key => {
    const items = input[key]
    if (!Array.isArray(items) || items.length < 2 || items.length > 11 || typeof items[0] !== 'string' || !items[0].trim()) {
      throw new Error(`${key}: servono un nome e da 1 a 10 domande.`)
    }
    if (rows && rows !== items.length - 1) throw new Error('Ogni categoria deve avere lo stesso numero di domande.')
    rows = items.length - 1
    const clues = items.slice(1).map((item: unknown, index: number) => {
      const label = `${items[0]}, domanda ${index + 1}`
      if (!isRecord(item)) throw new Error(`${label}: formato non valido.`)
      if (typeof item.points !== 'string' && typeof item.points !== 'number') throw new Error(`${label}: punteggio non valido.`)
      const points = Number(item.points)
      if (!Number.isSafeInteger(points) || points <= 0 || points > 1000000) throw new Error(`${label}: punteggio non valido.`)
      if (item.dailydouble !== 'yes' && item.dailydouble !== 'no') throw new Error(`${label}: dailydouble deve essere yes o no.`)
      return {
        points,
        dailyDouble: item.dailydouble === 'yes',
        answer: parseContent(item, 'answer', label),
        question: parseContent(item, 'question', label),
      }
    })
    return { name: items[0] as string, clues }
  })
  return { name, categories }
}

export function exportRound(round: Round): Record<string, unknown> {
  return Object.fromEntries(round.categories.map((category, index) => [
    `category${index + 1}`,
    [category.name, ...category.clues.map((clue, row) => ({
      order: String(row + 1), points: String(clue.points), dailydouble: clue.dailyDouble ? 'yes' : 'no',
      question: clue.question.value, question_type: clue.question.type,
      answer: clue.answer.value, answer_type: clue.answer.type,
    }))],
  ]))
}

export function createMatch(round: Round, players?: Player[]): Match {
  return {
    players: Array.from({ length: 6 }, (_, index) => ({ name: players?.[index]?.name || 'Player', score: 0 })),
    activePlayer: 1,
    board: round.categories.map(category => category.clues.map(() => 0)),
  }
}

export function restoreMatch(input: unknown, round: Round): Match {
  if (!isRecord(input) || !Array.isArray(input.players) || input.players.length !== 6 ||
    !Array.isArray(input.board) || input.board.length !== round.categories.length ||
    !Number.isInteger(input.activePlayer) || Number(input.activePlayer) < 1 || Number(input.activePlayer) > 7) {
    throw new Error('Partita salvata non valida.')
  }
  const players = input.players.map((player: unknown) => {
    if (!isRecord(player) || typeof player.name !== 'string' || !player.name.trim() || !Number.isSafeInteger(player.score)) {
      throw new Error('Giocatore salvato non valido.')
    }
    return { name: player.name, score: Number(player.score) }
  })
  const board = input.board.map((column: unknown, index: number) => {
    if (!Array.isArray(column) || column.length !== round.categories[index].clues.length ||
      column.some(value => !Number.isInteger(value) || value < 0 || value > 7)) throw new Error('Tabellone salvato non valido.')
    return [...column] as number[]
  })
  return { players, board, activePlayer: Number(input.activePlayer) }
}

export function scoreClue(match: Match, round: Round, cell: Cell, correct: boolean): boolean {
  const clue = round.categories[cell.category]?.clues[cell.clue]
  if (!clue || match.board[cell.category]?.[cell.clue] !== 0 || (!correct && match.activePlayer === 7)) return false
  const points = clue.points * (clue.dailyDouble ? 2 : 1)
  const player = match.players[match.activePlayer - 1]
  if (player) {
    const score = player.score + (correct ? points : -points)
    if (!Number.isSafeInteger(score)) return false
    player.score = score
  }
  if (correct) match.board[cell.category][cell.clue] = match.activePlayer
  return true
}

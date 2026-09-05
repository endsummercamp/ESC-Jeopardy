import { ref } from 'vue'
import type { Cell } from './game'

export type Screen = { kind: 'board' } | { kind: 'player'; player: number } | { kind: 'clue'; side: 'answer' | 'question'; cell: Cell }

function readRoute(): Screen {
  const hash = window.location.hash
  const clue = /^#\/(answer|question)\/(\d+)\/(\d+)$/.exec(hash)
  if (clue) return { kind: 'clue', side: clue[1] as 'answer' | 'question', cell: { category: Number(clue[2]) - 1, clue: Number(clue[3]) - 1 } }
  const player = /^#\/player\/([1-6])$/.exec(hash)
  if (player) return { kind: 'player', player: Number(player[1]) - 1 }
  return { kind: 'board' }
}

export const screen = ref<Screen>(readRoute())
export const lastCell = ref<Cell | null>(screen.value.kind === 'clue' ? screen.value.cell : null)

export function syncRoute() {
  screen.value = readRoute()
  if (screen.value.kind === 'clue') lastCell.value = screen.value.cell
}

export function showBoard() { window.location.hash = '/board' }
export function showSolution() {
  if (lastCell.value) window.location.hash = `/question/${lastCell.value.category + 1}/${lastCell.value.clue + 1}`
}

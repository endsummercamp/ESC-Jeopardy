import { computed, reactive, ref, watch } from 'vue'
import { assetUrl } from './assets'
import { createMatch, exportRound, isRecord, parseRound, restoreMatch, scoreClue } from './game'
import type { Cell, Match, Round } from './game'

const STORAGE_KEY = 'esc-jeopardy.v2'
export const round = ref<Round | null>(null)
export const match = reactive<Match>({ players: [], activePlayer: 1, board: [] })
export const loading = ref(true)
export const loadError = ref('')
export const storageMessage = ref('')
const history = ref<Match[]>([])
export const canUndo = computed(() => history.value.length > 0)

function read(key: string): unknown {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

function persist() {
  if (!round.value) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2, round: exportRound(round.value), roundName: round.value.name, match,
    }))
    storageMessage.value = ''
  } catch {
    storageMessage.value = 'Il browser non riesce a salvare la partita. Tieni aperta questa scheda.'
  }
}

function snapshot(): Match {
  return JSON.parse(JSON.stringify(match)) as Match
}

function remember(previous: Match) {
  history.value.push(previous)
  if (history.value.length > 50) history.value.shift()
}

export async function initialize() {
  loading.value = true
  loadError.value = ''
  try {
    try {
      const saved = read(STORAGE_KEY)
      if (isRecord(saved) && saved.version === 2) {
        const savedRound = parseRound(saved.round, typeof saved.roundName === 'string' ? saved.roundName : 'Partita')
        const savedMatch = restoreMatch(saved.match, savedRound)
        round.value = savedRound
        Object.assign(match, savedMatch)
        return
      }
    } catch {
      storageMessage.value = 'Non è stato possibile recuperare il salvataggio. Carico il tabellone demo.'
    }
    const response = await fetch(assetUrl('games/round_demo.json'))
    if (!response.ok) throw new Error('Non riesco a caricare le domande demo.')
    const demo = parseRound(JSON.parse((await response.text()).replace(/^\uFEFF/, '')), 'Demo')
    let initial = createMatch(demo)
    // Import the old AngularJS local-storage keys once, without deleting them.
    try {
      const players = read('ls.players')
      const game = read('ls.game')
      const board = read('ls.boardstatus')
      if (isRecord(players) && Array.isArray(board)) {
        initial = restoreMatch({
          players: Array.from({ length: 6 }, (_, index) => {
            const player = players[String(index + 1)]
            return isRecord(player) ? { name: player.name, score: Number(player.score) } : null
          }),
          activePlayer: isRecord(game) ? Number(game.player_in_control) : 1,
          board: demo.categories.map((category, index) => Array.isArray(board[index]) ? board[index].slice(0, category.clues.length) : []),
        }, demo)
      }
    } catch {
      storageMessage.value = 'Il vecchio salvataggio non è leggibile. È stato conservato nel browser.'
    }
    round.value = demo
    Object.assign(match, initial)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Impossibile caricare la partita.'
  } finally {
    loading.value = false
  }
}

watch(match, () => { if (!loading.value) persist() }, { deep: true })

export function selectPlayer(id: number) {
  if (id >= 1 && id <= 7) match.activePlayer = id
}

export function award(cell: Cell, correct: boolean) {
  if (!round.value) return
  const previous = snapshot()
  if (scoreClue(match, round.value, cell, correct)) remember(previous)
}

export function renamePlayer(index: number, name: string) {
  const trimmed = name.trim().slice(0, 40)
  if (!trimmed || !match.players[index] || trimmed === match.players[index].name) return
  remember(snapshot())
  match.players[index].name = trimmed
}

export function undo() {
  const previous = history.value.pop()
  if (previous) Object.assign(match, previous)
}

export function resetMatch() {
  if (!round.value) return
  remember(snapshot())
  Object.assign(match, createMatch(round.value, match.players))
}

export function replaceRound(next: Round) {
  loadError.value = ''
  round.value = next
  history.value = []
  Object.assign(match, createMatch(next, match.players))
  persist()
}

export function downloadRound() {
  if (!round.value) return
  const url = URL.createObjectURL(new Blob([JSON.stringify(exportRound(round.value), null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${round.value.name.replace(/[^a-z0-9_-]/gi, '_') || 'round'}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

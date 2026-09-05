<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Scoreboard from './components/Scoreboard.vue'
import GameBoard from './components/GameBoard.vue'
import ClueView from './components/ClueView.vue'
import PlayerSetup from './components/PlayerSetup.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import GameMenu from './components/GameMenu.vue'
import { award, initialize, loading, loadError, match, renamePlayer, round, selectPlayer, storageMessage, undo } from './store'
import { screen, showBoard, showSolution, syncRoute } from './navigation'

const menuOpen = ref(false)
const currentClue = computed(() => screen.value.kind === 'clue' ? round.value?.categories[screen.value.cell.category]?.clues[screen.value.cell.clue] : null)
const completed = computed(() => screen.value.kind === 'clue' && !!match.board[screen.value.cell.category]?.[screen.value.cell.clue])

function score(correct: boolean) {
  if (screen.value.kind === 'clue') award(screen.value.cell, correct)
}
function saveName(name: string) {
  if (screen.value.kind === 'player') renamePlayer(screen.value.player, name)
  showBoard()
}
function onKey(event: KeyboardEvent) {
  if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey ||
    (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest('input, textarea, select')))) return
  if (event.key === '?') {
    event.preventDefault()
    menuOpen.value = !menuOpen.value
    return
  }
  if (menuOpen.value || loading.value || !round.value) return
  const key = event.key.toLowerCase()
  if (!event.altKey && !event.shiftKey && /^[1-7]$/.test(key)) selectPlayer(Number(key))
  else if (event.altKey && !event.shiftKey && key === 'y') score(true)
  else if (event.altKey && !event.shiftKey && key === 'n') score(false)
  else if (event.altKey && !event.shiftKey && key === 'z') undo()
  else if (event.shiftKey && !event.altKey && key === 'b') showBoard()
  else if (event.shiftKey && !event.altKey && key === 'q') showSolution()
  else return
  event.preventDefault()
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)
  window.addEventListener('keydown', onKey)
  void initialize()
})
onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="game-shell">
    <Scoreboard :players="match.players" :active-player="match.activePlayer" @select="selectPlayer" />
    <main class="viewport">
      <div v-if="loading" class="message-screen" role="status">A-A-A-Antani…</div>
      <div v-else-if="loadError" class="message-screen" role="alert"><p>{{ loadError }}</p><button class="pixel-button" @click="initialize">Riprova</button><button class="pixel-button" @click="menuOpen = true">Importa domande</button></div>
      <template v-else-if="round">
        <GameBoard v-if="screen.kind === 'board'" :round="round" :board="match.board" />
        <PlayerSetup v-else-if="screen.kind === 'player'" :key="screen.player" :player="match.players[screen.player]" :number="screen.player + 1" @save="saveName" @cancel="showBoard" />
        <ClueView v-else-if="screen.kind === 'clue' && currentClue" :key="`${screen.side}/${screen.cell.category}/${screen.cell.clue}`" :clue="currentClue" :side="screen.side" :completed="completed" :active-player="match.activePlayer" @score="score" @solution="showSolution" @board="showBoard" />
        <div v-else class="message-screen"><p>Questa domanda non esiste.</p><button class="pixel-button" @click="showBoard">Tabellone</button></div>
      </template>
    </main>
    <footer class="footer">
      <div class="game-message" :class="`player${match.activePlayer}`" aria-live="polite">
        {{ match.activePlayer === 7 ? 'Nessuno ha indovinato' : `Player ${match.activePlayer} is in control of the board` }}
      </div>
      <div class="footer-controls">
        <button class="help-toggle" title="Comandi e partita (?)" aria-label="Comandi e partita" @click="menuOpen = true">?</button>
        <MusicPlayer />
        <a class="antani" href="#/board">(<span class="flipped">c</span>)&nbsp;Antani</a>
      </div>
    </footer>
    <p v-if="storageMessage" class="storage-message" role="status">{{ storageMessage }}</p>
    <GameMenu :open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

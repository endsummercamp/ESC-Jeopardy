<script setup lang="ts">
import { ref, watch } from 'vue'
import { assetUrl } from '../assets'
import { parseRound } from '../game'
import type { Round } from '../game'
import { canUndo, downloadRound, replaceRound, resetMatch, round, undo } from '../store'
import { lastCell, showBoard } from '../navigation'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const pending = ref<Round | null>(null)
const resetting = ref(false)
const busy = ref(false)
watch(() => props.open, open => {
  if (open) dialog.value?.showModal()
  else dialog.value?.close()
}, { flush: 'post' })

const shortcuts = [
  ['1–6', 'Seleziona il giocatore'], ['7', 'Nessuno ha indovinato'],
  ['Alt + Y', 'Assegna i punti / chiudi la casella'], ['Alt + N', 'Sottrai i punti'],
  ['Shift + Q', 'Mostra la soluzione'], ['Shift + B', 'Torna al tabellone'],
  ['Alt + Z', 'Annulla l’ultima azione'], ['?', 'Apri o chiudi questo menu'],
]

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  pending.value = null
  resetting.value = false
  busy.value = true
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Il file delle domande deve essere inferiore a 5 MB.')
    pending.value = parseRound(JSON.parse((await file.text()).replace(/^\uFEFF/, '')), file.name.replace(/\.json$/i, ''))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'File non valido.'
  } finally {
    input.value = ''
    busy.value = false
  }
}

async function loadDemo() {
  error.value = ''
  pending.value = null
  resetting.value = false
  busy.value = true
  try {
    const response = await fetch(assetUrl('games/round_demo.json'))
    if (!response.ok) throw new Error('Impossibile caricare la demo.')
    pending.value = parseRound(JSON.parse((await response.text()).replace(/^\uFEFF/, '')), 'Demo')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Impossibile caricare la demo.'
  } finally { busy.value = false }
}

function confirmRound() {
  if (!pending.value) return
  replaceRound(pending.value)
  pending.value = null
  lastCell.value = null
  showBoard()
  emit('close')
}

function confirmReset() {
  resetMatch()
  resetting.value = false
  lastCell.value = null
  showBoard()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="game-menu" aria-labelledby="menu-title" @close="$emit('close')" @click="event => { if (event.target === dialog) emit('close') }">
    <div class="menu-heading">
      <h1 id="menu-title">Comandi e partita</h1>
      <button class="pixel-button" aria-label="Chiudi menu" @click="$emit('close')">×</button>
    </div>
    <table><tbody><tr v-for="[keys, description] in shortcuts" :key="keys"><th scope="row">{{ keys }}</th><td>{{ description }}</td></tr></tbody></table>
    <p>Domande: {{ round?.name }}</p>
    <div class="button-row">
      <button class="pixel-button" :disabled="!canUndo" @click="undo">Annulla azione</button>
      <button class="pixel-button" :disabled="!round || busy" @click="resetting = true; pending = null">Nuova partita</button>
      <button class="pixel-button" :disabled="busy" @click="fileInput?.click()">Importa domande</button>
      <button class="pixel-button" :disabled="!round" @click="downloadRound">Esporta domande</button>
      <button class="pixel-button" :disabled="busy" @click="loadDemo">Carica demo</button>
      <input ref="fileInput" class="sr-only" type="file" accept=".json,application/json" tabindex="-1" @change="importFile">
    </div>
    <p v-if="busy" role="status">Caricamento…</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <div v-if="pending" class="confirmation">
      <p>Caricare “{{ pending.name }}” ({{ pending.categories.length }} categorie)? I punteggi e le caselle della partita corrente verranno azzerati.</p>
      <div class="button-row"><button class="pixel-button" @click="confirmRound">Carica</button><button class="pixel-button" @click="pending = null">Annulla</button></div>
    </div>
    <div v-if="resetting" class="confirmation">
      <p>Azzerare punteggi e caselle? I nomi dei giocatori restano. Puoi annullare questa azione.</p>
      <div class="button-row"><button class="pixel-button" @click="confirmReset">Azzera</button><button class="pixel-button" @click="resetting = false">Annulla</button></div>
    </div>
  </dialog>
</template>

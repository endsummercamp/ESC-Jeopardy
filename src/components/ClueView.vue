<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { assetUrl } from '../assets'
import type { Clue } from '../game'

const props = defineProps<{ clue: Clue; side: 'answer' | 'question'; completed: boolean; activePlayer: number }>()
defineEmits<{ score: [correct: boolean]; solution: []; board: [] }>()
const content = computed(() => props.clue[props.side])
const html = computed(() => DOMPurify.sanitize(content.value.value, {
  ALLOWED_TAGS: ['br', 'b', 'strong', 'i', 'em', 'u', 'p', 'pre', 'code', 'span', 'sub', 'sup'],
  ALLOWED_ATTR: [],
}))
</script>

<template>
  <section class="clue-screen" aria-label="Domanda">
    <div class="daily-double">{{ clue.dailyDouble ? 'Daily Double' : '' }}</div>
    <div class="clue-content">
      <div v-if="content.type === 'text'" class="clue-text" v-html="html"></div>
      <img v-else-if="content.type === 'image'" :src="assetUrl(content.value)" alt="Immagine della domanda">
      <audio v-else-if="content.type === 'audio'" :key="content.value" :src="assetUrl(content.value)" autoplay controls aria-label="Audio della domanda"></audio>
      <video v-else :key="content.value" :src="assetUrl(content.value)" autoplay controls playsinline aria-label="Video della domanda"></video>
    </div>
    <nav class="clue-actions" aria-label="Azioni sulla domanda">
      <button v-if="side === 'answer'" class="pixel-button" @click="$emit('solution')">Soluzione</button>
      <button class="pixel-button" :disabled="completed" @click="$emit('score', true)">{{ activePlayer === 7 ? 'Nessuno' : 'Corretta' }}</button>
      <button class="pixel-button" :disabled="completed || activePlayer === 7" @click="$emit('score', false)">Errata</button>
      <button class="pixel-button" @click="$emit('board')">Tabellone</button>
    </nav>
  </section>
</template>

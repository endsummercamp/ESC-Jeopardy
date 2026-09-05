<script setup lang="ts">
import { computed, ref } from 'vue'
import { assetUrl } from '../assets'

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const error = ref('')
const label = computed(() => playing.value ? 'Metti in pausa la musica' : 'Avvia la musica')
function failed() {
  playing.value = false
  error.value = 'Musica non disponibile. Premi play per riprovare.'
}
async function toggle() {
  if (!audio.value) return
  error.value = ''
  if (!audio.value.paused) audio.value.pause()
  else {
    try { await audio.value.play() } catch { failed() }
  }
}
</script>

<template>
  <button type="button" class="music-toggle" :class="{ 'is-playing': playing }" :aria-label="label" :aria-pressed="playing" :title="error || label" @click="toggle">
    <span class="music-icon" aria-hidden="true"></span>
  </button>
  <audio ref="audio" class="theme-music" :src="assetUrl('assets/jeopardy/sounds/8bit_theme.mp3')" loop preload="none" @play="playing = true" @pause="playing = false" @error="failed"></audio>
  <span class="sr-only" role="status">{{ error }}</span>
</template>

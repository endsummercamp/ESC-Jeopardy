<script setup lang="ts">
import type { Player } from '../game'
defineProps<{ players: Player[]; activePlayer: number }>()
defineEmits<{ select: [id: number] }>()
</script>

<template>
  <header class="scoreboard" aria-label="Giocatori e punteggi">
    <div v-for="(player, index) in players" :key="index" class="player-summary" :class="`player${index + 1}`">
      <a :href="`#/player/${index + 1}`" class="player-name" :title="`Modifica ${player.name}`">{{ player.name }}</a>
      <button class="points" :aria-label="`Seleziona ${player.name}, ${player.score} punti`" :aria-pressed="activePlayer === index + 1" @click="$emit('select', index + 1)">
        {{ player.score }} Punti
      </button>
    </div>
  </header>
</template>

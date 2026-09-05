<script setup lang="ts">
import type { Round } from '../game'
defineProps<{ round: Round; board: number[][] }>()
</script>

<template>
  <section class="board" :style="{ '--columns': round.categories.length, '--rows': round.categories[0].clues.length }" aria-label="Tabellone">
    <div v-for="(category, categoryIndex) in round.categories" :key="categoryIndex" class="board-column">
      <h2 class="category">{{ category.name }}</h2>
      <div v-for="(clue, clueIndex) in category.clues" :key="clueIndex" class="clue-cell">
        <a :href="`#/answer/${categoryIndex + 1}/${clueIndex + 1}`" :class="`player${board[categoryIndex]?.[clueIndex] || 0}`"
          :aria-label="`${category.name}, ${clue.points} punti${board[categoryIndex]?.[clueIndex] ? ', completata' : ''}`">
          {{ clue.points }}
        </a>
      </div>
    </div>
  </section>
</template>

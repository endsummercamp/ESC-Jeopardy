<script setup lang="ts">
import { ref } from 'vue'
import type { Player } from '../game'
const props = defineProps<{ player: Player; number: number }>()
const emit = defineEmits<{ save: [name: string]; cancel: [] }>()
const name = ref(props.player.name)
function save() {
  if (name.value.trim()) emit('save', name.value)
}
</script>

<template>
  <form class="player-setup" @submit.prevent="save">
    <h1>Player {{ number }}</h1>
    <label for="player-name">Nome</label>
    <input id="player-name" v-model="name" maxlength="40" required autocomplete="off" autofocus>
    <div class="button-row">
      <button class="pixel-button" type="submit" :disabled="!name.trim()">Salva</button>
      <button class="pixel-button" type="button" @click="$emit('cancel')">Annulla</button>
    </div>
  </form>
</template>

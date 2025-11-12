<template>
  <div class="ga-node">
    <div class="ga-node-head">
      <span>{{ ga.name }}</span>
      <button @click="removeNode">❌</button>
      <button @click="addChild">➕ Sub-Ga</button>
    </div>

    <transition-group name="fade" tag="div" v-if="ga.subGa.length > 0">
      <GaNode
        v-for="(child, idx) in ga.subGa"
        :key="child.name"
        :ga="child"
        @remove="handleRemoveChild(idx)"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import type { Ga } from '@/stores/models/ga.model'
import { usePendingGa } from '@/stores/pendingGa'

const props = defineProps<{
  ga: Ga
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const store = usePendingGa()

function removeNode() {
  emit('remove')
}

function handleRemoveChild(index: number) {
  const err = store.removeGaAtIndexOf(index, props.ga.subGa)
  if (err) console.error(err.message)
}

function addChild() {
  const name = prompt('Enter Sub-Ga name:')
  if (!name) return
  const err = store.newGaAt(name, props.ga)
  if (err) alert(err.message)
}
</script>

<style lang="css" scoped>
.ga-node {
  padding: 0.75rem 0.25rem;
  margin-left: 20px;
  border-left: 1px solid #ccc;
  padding-left: 10px;
}

.ga-node-head {
  padding: 0.15rem;
  display: inline-block;
  background-color: antiquewhite;
}
.ga-node-head > span {
  padding-inline-end: 0.5rem;
  padding-inline-start: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

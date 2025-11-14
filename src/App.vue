<template>
  <h1>The house of the rising Ga</h1>
  <hr />
  <div class="container">
    <WeekDays style="width: 100%;" />
    <GaTree style="flex: none; max-width: 40%; overflow: auto; border-left: 8px solid gray; padding-left: 1rem;" />
  </div>
</template>

<script setup lang="ts">
import GaTree from './components/ga-tree.vue'
import WeekDays from './components/week-days.vue'
</script>

<style lang="css" scoped>
.container {
  display: flex;
  align-items: start;
  justify-content: stretch;
  gap: 1rem;
}
</style>

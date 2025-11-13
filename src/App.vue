<script setup lang="ts">
import { onMounted, ref } from 'vue'
import GaNodeComponent from './components/ga-node.vue'
import { usePendingGa } from './stores/pendingGa'

const pendingGa = usePendingGa()
const loadingPendingGa = ref<boolean>(false)
const savingGa = ref<boolean>(false)
const saveMessage = ref<string | null>(null)
const saveError = ref<string | null>(null)

async function loadPendingGa() {
  try {
    loadingPendingGa.value = true
    const err = await pendingGa.initFromJsonBin()
    if (err) alert(err.message)
  } catch (e: unknown) {
    alert(`Unexpected error: ${(e as Error).message}`)
  } finally {
    loadingPendingGa.value = false
  }
}

async function saveGa() {
  if (savingGa.value) return

  savingGa.value = true
  saveMessage.value = null
  saveError.value = null

  try {
    const err = await pendingGa.updateJsonBin()
    if (err) {
      saveError.value = err.message
    } else {
      saveMessage.value = 'Ga tree saved successfully'
      setTimeout(() => (saveMessage.value = ''), 3000)
    }
  } catch (e: unknown) {
    saveError.value = (e as Error).message
  } finally {
    savingGa.value = false
  }
}

onMounted(loadPendingGa)
</script>

<template>
  <h1>The house of the rising Ga</h1>
  <hr />
  <p v-if="loadingPendingGa">Loading pending tree ga</p>

  <div>
    <button style="display: inline; margin-inline-end: 0.5rem;" :disabled="savingGa" @click="saveGa">
      <span v-if="savingGa">Saving...</span>
      <span v-else>Save</span>
    </button>

    <span v-if="saveMessage" style="color: green">{{ saveMessage }}</span>
    <span v-if="saveError" style="color: red">{{ saveError }}</span>
  </div>
  <GaNodeComponent v-if="!loadingPendingGa" :ga="pendingGa.rootOfGa" :index="0" />
</template>

<style scoped></style>

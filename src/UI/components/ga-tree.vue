<template>
  <div>
    <p v-if="loadingPendingGa">Loading pending tree ga...</p>

    <div v-else>
      <button
        style="display: inline; margin-inline-end: 0.5rem"
        :disabled="savingGa || (!isDirty && !autoSave)"
        @click="saveGa"
      >
        <span>{{ savingGa ? 'Saving...' : 'Save pending Ga' }}</span>
      </button>

      <label style="margin-left: 1rem; margin-right: 1rem">
        <input type="checkbox" v-model="autoSave" /> Auto Save
      </label>

      <span v-if="saveMessage" style="color: green; display: inline">{{ saveMessage }}</span>
      <span v-if="saveError" style="color: red; display: inline">{{ saveError }}</span>
    </div>

    <GaNodeComponent v-if="!loadingPendingGa" :ga="pendingGa.rootOfGa" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GaNodeComponent from './ga-node.vue'
import { usePendingGa } from '@/stores/pendingGa'

const pendingGa = usePendingGa()
const loadingPendingGa = ref<boolean>(false)
const savingGa = ref<boolean>(false)
const saveMessage = ref<string | null>(null)
const saveError = ref<string | null>(null)
const isDirty = ref<boolean>(false)
const autoSave = ref<boolean>(false)

pendingGa.setOnChange(async () => {
  isDirty.value = true
  if (autoSave.value && !savingGa.value) {
    await saveGa()
  }
})

async function loadPendingGa() {
  try {
    loadingPendingGa.value = true
    const err = await pendingGa.initFromJsonBin()
    if (err) alert(err.message)
    isDirty.value = false
  } catch (e: unknown) {
    alert(`Unexpected error: ${(e as Error).message}`)
  } finally {
    loadingPendingGa.value = false
  }
}

async function saveGa() {
  if (savingGa.value || !isDirty.value) return

  savingGa.value = true
  saveMessage.value = null
  saveError.value = null

  try {
    const err = await pendingGa.updateJsonBin()
    if (err) {
      saveError.value = err.message
    } else {
      saveMessage.value = 'Ga tree saved successfully'
      isDirty.value = false
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

<style scoped></style>

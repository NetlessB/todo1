<template>
  <div>
    <p v-if="loading">Loading week data...</p>

    <div v-else>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        "
      >
        <div>
          <button @click="prevWeek">‹ هفته قبل</button>
          <button @click="nextWeek" style="margin-left: 0.5rem">هفته بعد ›</button>
          <button @click="goToCurrentWeek" :disabled="isCurrentWeek" style="margin-left: 0.5rem">
            ← هفته فعلی
          </button>
          <button @click="saveWeeks" style="margin-left: 0.5rem" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>

        <div>
          {{ weekRange }}
        </div>
      </div>

      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%">
        <tr>
          <th v-for="day in currentWeek" :key="day.date.toDateString()">
            {{ formatDayName(day.date) }}
            <button @click="editDay(day)" style="margin-left: 0.4rem">✏️</button>
          </th>
        </tr>
        <tr>
          <td v-for="day in currentWeek" :key="day.date.toDateString()">
            {{ day.text }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWeekStore } from '@/stores/weekGa'

const weekStore = useWeekStore()
const today = new Date()
const selectedDate = ref<Date>(new Date())
const saving = ref(false)
const loading = ref(true)

// --- Navigation ---
function prevWeek() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 7)
  selectedDate.value = d
}
function nextWeek() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 7)
  selectedDate.value = d
}
function goToCurrentWeek() {
  selectedDate.value = new Date()
}
const isCurrentWeek = computed(() => {
  const currentWeekStart = computeWeekStart(today)
  const selectedWeekStart = computeWeekStart(selectedDate.value)
  return currentWeekStart.getTime() === selectedWeekStart.getTime()
})

// --- Formatting ---
function formatDayName(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}
function formatISODate(d: Date) {
  return d.toISOString().split('T')[0]
}
function computeWeekStart(date: Date) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const firstDay = (weekStore.firstDayOfWeek as string) || 'Monday'
  const firstDayIndex = dayNames.indexOf(firstDay)
  const todayIndex = date.getDay()
  const diff = (todayIndex - firstDayIndex + 7) % 7
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

// --- Week data ---
const currentWeek = computed(() => {
  const weekStart = computeWeekStart(selectedDate.value)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const firstDay = (weekStore.firstDayOfWeek as string) || 'Monday'
  const firstDayIndex = dayNames.indexOf(firstDay)
  const orderedDays = [...dayNames.slice(firstDayIndex), ...dayNames.slice(0, firstDayIndex)]

  const weekKey = weekStore.getWeekKey
    ? weekStore.getWeekKey(selectedDate.value)
    : formatISODate(weekStart)
  const storedWeek = (weekStore.allWeeks && weekStore.allWeeks[weekKey!]) ?? {
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: '',
  }

  return orderedDays.map((dayName, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return {
      date,
      text: storedWeek[dayName] ?? '',
    }
  })
})

const weekRange = computed(() => {
  const start = computeWeekStart(selectedDate.value)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${formatISODate(start)} — ${formatISODate(end)}`
})

// --- Edit day ---
function editDay(day: { date: Date; text: string }) {
  const newText = prompt(`Enter text for ${formatDayName(day.date)}`, day.text)
  if (newText !== null) {
    const dayNames: (keyof (typeof weekStore.allWeeks)[string])[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const key = dayNames[day.date.getDay()]
    weekStore.setDayText(key!, newText, day.date)
  }
}

// --- Save weeks ---
async function saveWeeks() {
  saving.value = true
  try {
    await weekStore.saveAllWeeks()
    alert('All weeks saved successfully!')
  } catch (err) {
    alert(`Error saving: ${(err as Error).message}`)
  } finally {
    saving.value = false
  }
}

// --- Load weeks on mount ---
onMounted(async () => {
  loading.value = true
  try {
    await weekStore.loadAllWeeks()
  } catch (err) {
    console.error(err)
    alert('Error loading week data')
  } finally {
    loading.value = false
  }
})
</script>

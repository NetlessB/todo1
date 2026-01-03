// stores/weekStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface DayData {
  date: Date
  text: string
}

type WeekKey = string // تاریخ شروع هفته به صورت 'YYYY-MM-DD'
type WeekRecord = Record<string, Record<string, string>> // همه هفته‌ها

export const useWeekStore = defineStore('weekStore', () => {
  const allWeeks = ref<WeekRecord>({}) // ذخیره همه هفته‌ها

  const firstDayOfWeek = ref<
    'Monday' | 'Sunday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  >('Monday')

  function setFirstDayOfWeek(day: typeof firstDayOfWeek.value) {
    firstDayOfWeek.value = day
  }

  // محاسبه تاریخ شروع هفته بر اساس today و firstDayOfWeek
  function getWeekStart(today: Date = new Date()): Date {
    const dayNames: (keyof (typeof allWeeks.value)[string])[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const firstDayIndex = dayNames.indexOf(firstDayOfWeek.value)
    const todayIndex = today.getDay()
    const diff = (todayIndex - firstDayIndex + 7) % 7
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  // گرفتن کلید هفته به شکل YYYY-MM-DD
  function getWeekKey(date: Date = new Date()): WeekKey {
    const start = getWeekStart(date)
    return start.toISOString().split('T')[0] ?? ''
  }

  // گرفتن داده هفته جاری به صورت DayData[]
  function getCurrentWeek(): DayData[] {
    const weekKey = getWeekKey()
    const week = allWeeks.value[weekKey] || {
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      Saturday: '',
      Sunday: '',
    }

    const dayNames: (keyof typeof week)[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const firstDayIndex = dayNames.indexOf(firstDayOfWeek.value)
    const orderedDays = [...dayNames.slice(firstDayIndex), ...dayNames.slice(0, firstDayIndex)]

    const weekStart = getWeekStart()
    return orderedDays.map((dayName, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return {
        date,
        text: week[dayName] ?? '',
      }
    })
  }

  function setDayText(
    dayName: keyof (typeof allWeeks.value)[string],
    text: string,
    date: Date = new Date(),
  ) {
    const weekKey = getWeekKey(date)
    if (!allWeeks.value[weekKey]) {
      allWeeks.value[weekKey] = {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: '',
      }
    }
    allWeeks.value[weekKey][dayName] = text
  }

  // ------------ JSON Bin Integration ------------
  const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY
  const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID_WEEK

  async function loadAllWeeks(): Promise<void> {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY },
      })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)
      const data = await res.json()
      allWeeks.value = data.record as WeekRecord
    } catch (err) {
      console.error('Error loading all weeks:', err)
    }
  }

  async function saveAllWeeks(): Promise<void> {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allWeeks.value),
      })
      if (!res.ok) throw new Error(`Failed to save: ${res.statusText}`)
    } catch (err) {
      console.error('Error saving all weeks:', err)
    }
  }

  return {
    allWeeks,
    firstDayOfWeek,
    setFirstDayOfWeek,
    getWeekKey,
    getCurrentWeek,
    setDayText,
    loadAllWeeks,
    saveAllWeeks,
  }
})

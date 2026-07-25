<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { talks } from '../../data/talks'
import { formatDate } from '../logics'

function getSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')
}

const activeYear = ref<string>('all')
const chronologicalYears = ['2026', '2025', '2024', '2023']

// Group publications by year
const publicationsByYear = computed(() => {
  const map: Record<string, typeof talks> = {
    '2026': [],
    '2025': [],
    '2024': [],
    '2023': [],
  }

  talks.forEach((talk) => {
    const yearStr = talk.presentations[0]?.date ? new Date(talk.presentations[0].date).getFullYear().toString() : '2025'
    if (map[yearStr]) {
      map[yearStr].push(talk)
    } else {
      map['2025'].push(talk)
    }
  })

  return map
})

function selectYear(year: string) {
  activeYear.value = year
  if (year === 'all') {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.location.hash = `year-${year}`
    const el = document.getElementById(`year-${year}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

onMounted(() => {
  if (window.location.hash) {
    const hash = window.location.hash.replace('#', '').replace('year-', '')
    if (chronologicalYears.includes(hash)) {
      activeYear.value = hash
      setTimeout(() => {
        const el = document.getElementById(`year-${hash}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }
})
</script>

<template>
  <div class="my-6">
    <!-- Year Filter & Hash Navigation Bar -->
    <div class="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
      <span class="text-xs font-semibold opacity-50 uppercase tracking-wider select-none">Filter Year:</span>
      <button
        class="text-xs font-mono cursor-pointer bg-transparent border-none! p-0 transition-opacity"
        :class="activeYear === 'all' ? 'opacity-100 font-bold underline' : 'opacity-40 hover:opacity-100'"
        @mouseenter="activeYear = 'all'"
        @click="selectYear('all')"
      >
        All Years
      </button>
      <a
        v-for="y in chronologicalYears"
        :key="y"
        :href="`#year-${y}`"
        class="text-xs font-mono cursor-pointer bg-transparent border-none! p-0 transition-opacity !no-underline"
        :class="activeYear === y ? 'opacity-100 font-bold underline' : 'opacity-40 hover:opacity-100'"
        @mouseenter="activeYear = y"
        @click.prevent="selectYear(y)"
      >
        {{ y }}
      </a>
    </div>

    <!-- Vertical Timeline with Hash Section Anchors -->
    <div class="relative pl-6 border-l-2 border-gray-300 dark:border-gray-700 space-y-12">
      <div
        v-for="y in chronologicalYears"
        :id="`year-${y}`"
        :key="y"
        class="relative transition-opacity duration-300 scroll-mt-24"
        :class="activeYear === 'all' || activeYear === y ? 'opacity-100' : 'opacity-30'"
        @mouseenter="activeYear = y"
      >
        <!-- Year Marker Node with Anchor Link -->
        <div class="absolute -left-[31px] top-0 flex items-center gap-2 select-none">
          <div
            class="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 transition-all duration-300"
            :class="activeYear === y ? 'bg-current scale-125' : ''"
          />
          <a :href="`#year-${y}`" class="text-base font-bold font-mono opacity-90 !no-underline !text-current">
            {{ y }}
          </a>
        </div>

        <!-- Publication List for this Year -->
        <div class="pt-6 space-y-6">
          <div
            v-for="(talk, idx) in publicationsByYear[y]"
            :key="idx"
            class="py-2 transition-all duration-300"
          >
            <div v-if="talk.series" class="text-xs opacity-50 font-mono mb-0.5">
              {{ talk.series }}
            </div>

            <h3 :id="getSlug(talk.title)" class="text-base font-semibold leading-snug">
              {{ talk.title }}
              <a class="header-anchor" :href="`#${getSlug(talk.title)}`" aria-hidden="true">#</a>
            </h3>

            <div v-if="talk.description" class="text-sm opacity-70 mt-0.5 italic">
              {{ talk.description }}
            </div>

            <div
              v-for="(p, pIdx) in talk.presentations"
              :key="pIdx"
              class="mt-2 text-xs opacity-75 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <a :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-100">
                  {{ p.conference }}
                </a>
                <span class="opacity-60 ml-2">
                  {{ formatDate(p.date, false) }} · {{ p.location }}
                </span>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

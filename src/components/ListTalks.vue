<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { talks } from '../../data/talks'
import { formatDate } from '../logics'

function getSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')
}

function formatMainTag(series?: string) {
  if (!series)
    return ''
  const match = series.match(/^(\[[^\]]+\])/)
  return match ? match[1] : ''
}

function formatRankTag(series?: string) {
  if (!series)
    return ''
  const match = series.match(/\(([^)]+)\)/)
  return match ? `(${match[1]})` : ''
}

function highlightName(description?: string) {
  if (!description)
    return ''
  return description.replace(
    /Ravindrakumar( M\.)? Purohit/g,
    '<span class="text-[#f58025] dark:text-[#ff9933] font-semibold not-italic">Ravindrakumar M. Purohit</span>',
  )
}

const activeYear = ref<string>('all')
const chronologicalYears = ['2026', '2025', '2024', '2023']

// Group publications by year
const publicationsByYear = computed(() => {
  const map: Record<string, typeof talks> = {
    2026: [],
    2025: [],
    2024: [],
    2023: [],
  }

  talks.forEach((talk) => {
    const yearStr = talk.presentations[0]?.date ? new Date(talk.presentations[0].date).getFullYear().toString() : '2025'
    if (map[yearStr]) {
      map[yearStr].push(talk)
    }
    else {
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
  }
  else {
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
  <section class="my-6">
    <!-- Year Filter & Hash Navigation Bar -->
    <nav class="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
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
    </nav>

    <!-- Vertical Timeline with Hash Section Anchors -->
    <section class="relative pl-6 border-l-2 border-gray-300 dark:border-gray-700 space-y-12">
      <article
        v-for="y in chronologicalYears"
        :id="`year-${y}`"
        :key="y"
        class="relative transition-opacity duration-300 scroll-mt-24"
        :class="activeYear === 'all' || activeYear === y ? 'opacity-100' : 'opacity-30'"
        @mouseenter="activeYear = y"
      >
        <!-- Year Marker with Anchor Link (Side-aligned, no dot) -->
        <div class="absolute -left-[54px] top-1 text-right select-none w-10">
          <a :href="`#year-${y}`" class="text-sm font-bold font-mono opacity-60 hover:opacity-100 !no-underline !text-current">
            {{ y }}
          </a>
        </div>

        <!-- Publication List for this Year -->
        <ul class="pt-6 space-y-6 list-none pl-0!">
          <li
            v-for="(talk, idx) in publicationsByYear[y]"
            :key="idx"
            class="py-3 transition-all duration-300 flex flex-col sm:flex-row gap-2 sm:gap-4 list-none pl-0!"
          >
            <!-- Left Side: Series ID & Rank -->
            <div v-if="talk.series" class="w-24 shrink-0 text-sm font-semibold opacity-80 font-mono select-none text-center self-center flex flex-col gap-1">
              <span class="block">{{ formatMainTag(talk.series) }}</span>
              <span v-if="formatRankTag(talk.series)" class="block text-[11px] opacity-75 font-normal leading-tight">
                {{ formatRankTag(talk.series) }}
              </span>
            </div>

            <!-- Right Side: Publication Details -->
            <div class="flex-1">
              <h3 :id="getSlug(talk.title)" class="text-base font-semibold leading-snug">
                {{ talk.title }}
                <a class="header-anchor" :href="`#${getSlug(talk.title)}`" aria-hidden="true">#</a>
              </h3>

              <div v-if="talk.description" class="text-sm opacity-70 mt-1 italic" v-html="highlightName(talk.description)" />

              <div
                v-for="(p, pIdx) in talk.presentations"
                :key="pIdx"
                class="mt-1.5 text-xs opacity-75 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <a :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-100 font-semibold">
                    {{ p.conference }}
                  </a>
                  <span class="opacity-60 ml-2">
                    {{ formatDate(p.date, false) }} · {{ p.location }}
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
        </article>
      </section>
    </section>
  </template>

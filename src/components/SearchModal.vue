<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { talks } from '../../data/talks'

const isOpen = ref(false)
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const router = useRouter()

const pages = [
  { path: '/', title: 'Home', desc: 'Welcome page, recent news & key updates.' },
  { path: '/talks', title: 'Publications', desc: 'Peer-reviewed publications & conference papers.' },
  { path: '/projects', title: 'Projects', desc: 'Engineering projects and speech systems.' },
  { path: '/experience', title: 'Experience & Background', desc: 'Academic positions, honors, education, and service.' },
  { path: '/posts', title: 'Blog & Vlogs', desc: 'Articles, blogs, and presentations.' },
]

function getSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')
}

const posts = computed(() => {
  return router.getRoutes()
    .filter(i => i.path.startsWith('/posts') && i.meta?.frontmatter?.date && !i.meta?.frontmatter?.draft)
    .map(i => ({
      path: i.path,
      title: (i.meta?.frontmatter?.title as string) || '',
      desc: (i.meta?.frontmatter?.description as string) || 'Blog post article.',
    }))
})

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const matchedPages = pages.filter(p =>
    p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query),
  ).map(p => ({ ...p, type: 'Page' }))

  const matchedTalks = talks.filter(t =>
    t.title.toLowerCase().includes(query)
    || t.description?.toLowerCase().includes(query)
    || t.presentations?.some(p => p.conference.toLowerCase().includes(query)),
  ).map(t => ({
    path: `/talks#${getSlug(t.title)}`,
    title: t.title,
    desc: t.description || t.presentations[0]?.conference || '',
    type: 'Publication',
  }))

  const matchedPosts = posts.value.filter(p =>
    p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query),
  ).map(p => ({ ...p, type: 'Blog Post' }))

  return [...matchedPages, ...matchedTalks, ...matchedPosts]
})

function openSearch() {
  isOpen.value = true
  searchQuery.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleClose() {
  isOpen.value = false
  searchQuery.value = ''
}

function navigateTo(path: string) {
  handleClose()
  router.push(path)
}
</script>

<template>
  <div class="inline-block print:hidden">
    <!-- Search Toggle Button -->
    <button
      type="button"
      class="px-2 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1 opacity-75 hover:opacity-100 focus:outline-none"
      title="Search site..."
      @click="openSearch"
    >
      <span i-ri-search-line class="text-sm" />
      <span class="lt-md:hidden">Search</span>
    </button>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/45 backdrop-blur-md"
          @click.self="handleClose"
        >
          <div class="relative w-full max-w-lg bg-base rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 modal-popup-box">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2.5 mb-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span i-ri-search-line /> Search Website
              </h4>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-bold border-none! bg-transparent cursor-pointer focus:outline-none"
                @click="handleClose"
              >
                ✕
              </button>
            </div>

            <!-- Search Field -->
            <div class="mb-4 relative">
              <input
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Type to search pages, publications, blogs..."
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-500/5 focus:bg-transparent focus:border-gray-400 dark:focus:border-gray-600 outline-none text-current transition-all"
              />
            </div>

            <!-- Search Results -->
            <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div v-if="searchQuery.trim() === ''" class="text-center py-8 text-xs opacity-50">
                Type something to search the website
              </div>
              <div v-else-if="searchResults.length === 0" class="text-center py-8 text-xs opacity-50">
                No matching results found for "{{ searchQuery }}"
              </div>
              <button
                v-for="(result, idx) in searchResults"
                :key="idx"
                type="button"
                class="w-full p-3 rounded-lg text-left bg-gray-500/5 hover:bg-gray-500/10 transition-all border-none! cursor-pointer flex items-start justify-between gap-3 text-current focus:outline-none group"
                @click="navigateTo(result.path)"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-500/15 opacity-70 scale-95 shrink-0">
                      {{ result.type }}
                    </span>
                    <span class="font-semibold text-sm group-hover:underline leading-snug">
                      {{ result.title }}
                    </span>
                  </div>
                  <div class="text-xs opacity-60 mt-1 line-clamp-2">
                    {{ result.desc }}
                  </div>
                </div>
                <span class="text-xs opacity-40 group-hover:opacity-100 shrink-0 self-center transition-opacity">Go ↗</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

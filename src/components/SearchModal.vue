<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { talks } from '../../data/talks'

// Raw imports of markdown pages for client-side search index
import indexRaw from '../../pages/index.md?raw'
import experienceRaw from '../../pages/experience.md?raw'
import projectsRaw from '../../pages/projects.md?raw'
import useRaw from '../../pages/use.md?raw'
import talksRaw from '../../pages/talks.md?raw'
import welcomePostRaw from '../../pages/posts/welcome-to-my-blog.md?raw'

interface SearchItem {
  path: string
  title: string
  desc: string
  type: 'Page' | 'Publication' | 'Blog Post'
  rawContent: string
}

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

function cleanMarkdownText(md: string): string {
  return md
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[*#_`\[\]()\-]/g, ' ') // remove markdown syntax characters
    .replace(/\s+/g, ' ') // normalize spaces
    .trim()
}

// Parses raw markdown into searchable page sections
function parseMarkdownSections(raw: string, pagePath: string, pageTitle: string): SearchItem[] {
  const sections: SearchItem[] = []
  const cleanContent = raw.replace(/^---[\s\S]*?---/, '') // clean frontmatter
  const parts = cleanContent.split(/(?=^#{1,3}\s+)/m) // split by headers
  
  const firstPart = parts[0]?.trim()
  if (firstPart && firstPart.length > 50) {
    sections.push({
      path: pagePath,
      title: pageTitle,
      desc: cleanMarkdownText(firstPart).substring(0, 160) + '...',
      type: 'Page',
      rawContent: firstPart,
    })
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim()
    const lines = part.split('\n')
    const headerLine = lines[0] || ''
    const headerText = headerLine.replace(/^#{1,3}\s+/, '').trim()
    const contentText = lines.slice(1).join('\n').trim()
    
    sections.push({
      path: `${pagePath}#${getSlug(headerText)}`,
      title: `${pageTitle} — ${headerText}`,
      desc: cleanMarkdownText(contentText).substring(0, 160) + '...',
      type: 'Page',
      rawContent: part,
    })
  }
  
  return sections
}

// Global searchable item database compiled on client side
const searchItems = computed(() => {
  const items: SearchItem[] = []
  
  // 1. Static Pages
  items.push(...parseMarkdownSections(indexRaw, '/', 'Home'))
  items.push(...parseMarkdownSections(experienceRaw, '/experience', 'Experience'))
  items.push(...parseMarkdownSections(projectsRaw, '/projects', 'Projects'))
  items.push(...parseMarkdownSections(useRaw, '/use', 'What I Use'))
  items.push(...parseMarkdownSections(talksRaw, '/talks', 'Publications'))
  
  // 2. Publications Database
  talks.forEach(t => {
    items.push({
      path: `/talks#${getSlug(t.title)}`,
      title: t.title,
      desc: t.description || t.presentations[0]?.conference || '',
      type: 'Publication',
      rawContent: `${t.title} ${t.description || ''} ${t.presentations.map(p => `${p.conference} ${p.location}`).join(' ')}`,
    })
  })

  // 3. Blog Posts
  posts.value.forEach(p => {
    let raw = ''
    if (p.path.endsWith('welcome-to-my-blog')) {
      raw = welcomePostRaw
    }
    items.push({
      path: p.path,
      title: p.title,
      desc: p.desc,
      type: 'Blog Post',
      rawContent: `${p.title} ${p.desc} ${raw}`,
    })
  })

  return items
})

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const results = searchItems.value.map(item => {
    let score = 0
    const title = item.title.toLowerCase()
    const desc = item.desc.toLowerCase()
    const content = item.rawContent.toLowerCase()

    if (title.includes(query)) {
      score += 100
      if (title.startsWith(query)) {
        score += 50
      }
    }
    if (desc.includes(query)) {
      score += 25
    }
    
    // Count matches in raw text content
    let index = content.indexOf(query)
    while (index !== -1) {
      score += 10
      index = content.indexOf(query, index + 1)
    }

    return { ...item, score }
  })

  // Filter matches and sort by highest relevance score
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
})

function highlightText(text: string, query: string) {
  if (!query) return text
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200/50 dark:bg-yellow-500/30 text-current rounded px-0.5 font-semibold">$1</mark>')
}

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
  const query = searchQuery.value.trim()
  const [urlPath, hash] = path.split('#')
  router.push({
    path: urlPath,
    query: query ? { highlight: query } : undefined,
    hash: hash ? `#${hash}` : undefined,
  })
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

            <!-- Boundaryless Search Field -->
            <div class="mb-4 relative border-b border-gray-200 dark:border-gray-800 pb-1">
              <input
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Type to search pages, publications, blogs..."
                class="w-full px-0 py-2 text-sm bg-transparent border-none! outline-none! text-current focus:ring-0"
              />
              <span class="absolute right-0 top-3 text-sm opacity-40 pointer-events-none" i-ri-search-line />
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
                    <span class="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-500/15 opacity-70 scale-95 shrink-0 select-none">
                      {{ result.type }}
                    </span>
                    <span class="font-semibold text-sm group-hover:underline leading-snug" v-html="highlightText(result.title, searchQuery)">
                    </span>
                  </div>
                  <div class="text-xs opacity-60 mt-1 line-clamp-2" v-html="highlightText(result.desc, searchQuery)">
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

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-popup-box {
  animation: modal-popup 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-fade-leave-active .modal-popup-box {
  animation: modal-popdown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modal-popup {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-popdown {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
}
</style>

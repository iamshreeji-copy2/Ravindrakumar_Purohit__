<script setup lang="ts">
import type { Post } from '~/types'
import { useRouter } from 'vue-router/auto'
import { englishOnly } from '~/logics'
import dayjs from 'dayjs'

const props = defineProps<{
  type?: string
  posts?: Post[]
  extra?: Post[]
}>()

const router = useRouter()
const routes: Post[] = router.getRoutes()
  .filter(i => i.path.startsWith('/posts') && i.meta.frontmatter.date && !i.meta.frontmatter.draft)
  .filter(i => !i.path.endsWith('.html') && (i.meta.frontmatter.type || 'blog').split('+').includes(props.type))
  .map(i => ({
    path: i.meta.frontmatter.redirect || i.path,
    title: i.meta.frontmatter.title,
    date: i.meta.frontmatter.date,
    lang: i.meta.frontmatter.lang,
    duration: i.meta.frontmatter.duration,
    recording: i.meta.frontmatter.recording,
    upcoming: i.meta.frontmatter.upcoming,
    redirect: i.meta.frontmatter.redirect,
    place: i.meta.frontmatter.place,
  }))

const posts = computed(() =>
  [...(props.posts || routes), ...props.extra || []]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .filter(i => !englishOnly.value || !i.lang || i.lang === 'en'),
)

const getYear = (a: Date | string | number) => new Date(a).getFullYear()
const formatMonth = (d: string | Date) => dayjs(d).format('MMM')

const postsByYear = computed(() => {
  const groups: Record<string, Post[]> = {}
  for (const post of posts.value) {
    const y = getYear(post.date)
    if (!groups[y])
      groups[y] = []
    groups[y].push(post)
  }
  return groups
})

const years = computed(() => Object.keys(postsByYear.value).sort((a, b) => Number(b) - Number(a)))
</script>

<template>
  <div class="max-w-300 mx-auto">
    <template v-if="!posts.length">
      <div py2 op50>
        { nothing here yet }
      </div>
    </template>

    <section v-else class="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-6 my-6">
      <!-- Year Group -->
      <div v-for="y in years" :key="y" class="relative space-y-6">
        <!-- Year Marker (Left aligned, no dot) -->
        <div class="absolute right-full mr-12 top-1 text-right select-none">
          <span class="text-sm font-bold font-mono opacity-60">{{ y }}</span>
        </div>

        <!-- Post Items for this Year -->
        <div
          v-for="route, idx in postsByYear[y]"
          :key="route.path"
          class="relative flex items-start gap-3 group"
        >
          <!-- Timeline dot centered on vertical bar -->
          <div class="absolute -left-[29px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 group-hover:scale-125 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-all duration-300" />
          
          <!-- Month indicator badge -->
          <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-500/10 shrink-0 mt-0.5 select-none">
            {{ formatMonth(route.date) }}
          </span>

          <!-- Post Content Details -->
          <div class="flex-1 text-sm sm:text-base leading-relaxed">
            <component
              :is="route.path.includes('://') ? 'a' : 'RouterLink'"
              v-bind="
                route.path.includes('://') ? {
                  href: route.path,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                } : {
                  to: route.path,
                }
              "
              class="font-medium hover:underline !no-underline !text-current"
            >
              {{ route.title }}
            </component>

            <!-- Language Badge -->
            <span
              v-if="route.lang === 'zh'"
              class="text-[10px] bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml-2 align-middle"
            >中文</span>
            <span
              v-if="route.lang === 'ja'"
              class="text-[10px] bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml-2 align-middle"
            >日本語</span>

            <!-- External Link Icon -->
            <span
              v-if="route.redirect"
              class="align-middle op50 flex-none text-xs ml-1 i-carbon-arrow-up-right inline-block"
              title="External"
            />

            <!-- Reading Duration -->
            <span v-if="route.duration" class="opacity-50 text-xs ml-2 font-mono align-middle">· {{ route.duration }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

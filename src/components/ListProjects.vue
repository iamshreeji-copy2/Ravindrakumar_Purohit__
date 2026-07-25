<script setup lang="ts">
defineProps<{ projects: Record<string, any[]> }>()

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}
</script>

<template>
  <div class="max-w-300 mx-auto">
    <p text-center mt--2 mb8 op60 text-lg italic>
      Research implementations, speech synthesis models, and engineering projects.
    </p>
    <div
      v-for="key, cidx in Object.keys(projects)" :key="key" slide-enter
      :style="{ '--enter-stage': cidx + 1 }"
    >
      <div
        :id="slug(key)"
        select-none relative h18 mt6 pointer-events-none slide-enter
        :style="{
          '--enter-stage': cidx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span text-4em color-transparent absolute left--0.5rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op30 dark:op20>{{ key }}</span>
      </div>
      <div
        class="project-grid py-2 max-w-500 w-max mx-auto"
        grid="~ cols-1 md:cols-2 gap-4 lg:cols-3"
      >
        <a
          v-for="item, idx in projects[key]"
          :key="idx"
          class="item relative flex items-center"
          :href="item.link"
          target="_blank"
          :title="item.name"
        >
          <div class="pt-2 pr-5 shrink-0">
            <div class="text-2xl opacity-60" :class="item.icon || 'i-carbon-code'" />
          </div>
          <div class="flex-auto">
            <div class="text-normal font-medium">{{ item.name }}</div>
            <div class="desc text-sm opacity-60 font-normal" v-html="item.desc" />
          </div>
        </a>
      </div>
    </div>
    <div>
      <div class="table-of-contents">
        <div class="table-of-contents-anchor">
          <div class="i-ri-menu-2-fill" />
        </div>
        <ul>
          <li v-for="key of Object.keys(projects)" :key="key">
            <a :href="`#${slug(key)}`">{{ key }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-grid a.item {
  background: transparent;
  font-size: 1.1rem;
  width: 350px;
  max-width: 100%;
  padding: 0.5rem 0.875rem 0.875rem;
  border-radius: 6px;
}

.project-grid a.item:hover {
  background: #88888811;
}
</style>

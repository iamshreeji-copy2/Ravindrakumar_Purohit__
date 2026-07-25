<script setup lang="ts">
import { watch } from 'vue'

const route = useRoute()

function highlightOnPage(text: string) {
  if (typeof document === 'undefined') return
  const mainEl = document.querySelector('main')
  if (!mainEl) return

  const escapedText = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regex = new RegExp(`(${escapedText})`, 'gi')

  const walk = (node: any) => {
    if (node.nodeType === 3) { // 3 is Node.TEXT_NODE
      const parent = node.parentNode
      if (!parent) return
      
      const parentName = parent.nodeName
      const isElement = parent.nodeType === 1 // ELEMENT_NODE
      
      if (
        ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT'].includes(parentName) ||
        (isElement && parent.classList?.contains('highlighted-saffron')) ||
        (isElement && typeof parent.closest === 'function' && parent.closest('.highlighted-saffron-wrapper'))
      ) {
        return
      }

      const val = node.nodeValue || ''
      if (regex.test(val)) {
        const span = document.createElement('span')
        span.className = 'highlighted-saffron-wrapper'
        span.innerHTML = val.replace(
          regex,
          '<mark class="highlighted-saffron" style="background-color: #FF9933; color: #fff; border-radius: 3px; padding: 0.1em 0.25em; font-weight: 600;">$1</mark>'
        )
        parent.replaceChild(span, node)
      }
    } else {
      const children = Array.from(node.childNodes)
      for (const child of children) {
        walk(child)
      }
    }
  }

  walk(mainEl)
}

function removeHighlights() {
  if (typeof document === 'undefined') return
  const wrappers = document.querySelectorAll('.highlighted-saffron-wrapper')
  wrappers.forEach(wrapper => {
    const parent = wrapper.parentNode
    if (parent) {
      const textNode = document.createTextNode(wrapper.textContent || '')
      parent.replaceChild(textNode, wrapper)
    }
  })
}

function openContainingAccordions(matchEl: HTMLElement) {
  let parent = matchEl.parentElement
  while (parent && parent.tagName !== 'MAIN') {
    if (parent.classList.contains('grid') && parent.classList.contains('grid-rows-[0fr]')) {
      const parentContainer = parent.parentElement
      if (parentContainer) {
        const button = parentContainer.querySelector('button')
        if (button) {
          button.click()
        }
      }
    }
    parent = parent.parentElement
  }
}

// Apply highlights with retries to catch asynchronous rendering/mount delays
function triggerHighlightWithRetries(query: string, attempts = 3) {
  let count = 0
  const run = () => {
    removeHighlights()
    highlightOnPage(query)
    
    const firstMatch = document.querySelector('.highlighted-saffron') as HTMLElement | null
    if (firstMatch) {
      openContainingAccordions(firstMatch)
      setTimeout(() => {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } else if (count < attempts) {
      count++
      setTimeout(run, 150)
    }
  }
  run()
}

// Watch route path and query changes together to clean and apply saffron highlights dynamically
watch(
  () => [route.path, route.query.highlight],
  ([path, queryVal]) => {
    if (typeof window === 'undefined') return
    
    removeHighlights()
    if (queryVal) {
      triggerHighlightWithRetries(String(queryVal))
    }
  },
  { immediate: true }
)

const imageModel = ref<HTMLImageElement>()
const imageAlt = ref<string>()

function setImageModel(img: HTMLImageElement) {
  imageModel.value = img
  imageAlt.value = img.alt
  const figure = img.closest('figure')
  if (figure) {
    const caption = figure.querySelector('figcaption')
    if (caption?.textContent)
      imageAlt.value ||= caption.textContent
  }
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLImageElement
  if (!(first instanceof HTMLElement))
    return
  if (first.tagName !== 'IMG')
    return
  if (first.classList.contains('no-preview'))
    return
  if (path.some(el => el instanceof HTMLElement && ['A', 'BUTTON'].includes(el.tagName)))
    return
  if (!path.some(el => el instanceof HTMLElement && (el.classList.contains('prose') || el.classList.contains('photos'))))
    return

  // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
  const pos = first.getBoundingClientRect()
  await new Promise(resolve => setTimeout(resolve, 50))
  const newPos = first.getBoundingClientRect()
  if (pos.left !== newPos.left || pos.top !== newPos.top)
    return

  setImageModel(first)
})

onKeyStroke('ArrowRight', (e) => {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return

  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const nextIndex = index + 1
  const nextImg = document.querySelector(`img[data-photo-index="${nextIndex}"]`) as HTMLImageElement | null
  if (nextImg) {
    setImageModel(nextImg)
    e.preventDefault()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return

  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const prevIndex = index - 1
  const prevImg = document.querySelector(`img[data-photo-index="${prevIndex}"]`) as HTMLImageElement | null
  if (prevImg) {
    setImageModel(prevImg)
    e.preventDefault()
  }
})

onKeyStroke('Escape', (e) => {
  if (imageModel.value) {
    imageModel.value = undefined
    e.preventDefault()
  }
})
</script>

<template>
  <NavBar />
  <main class="px-7 py-10 of-x-hidden">
    <RouterView />
    <Footer :key="route.path" />
  </main>
  <Transition name="fade">
    <div v-if="imageModel" fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7 @click="imageModel = undefined">
      <div absolute top-0 left-0 right-0 bottom-0 bg-black:50 z--1 />
      <img :src="imageModel.src" :alt="imageModel.alt" :class="imageModel.className" max-w-screen max-h-screen w-full h-full object-contain>
      <div v-if="imageAlt" text-white bg-black:50 absolute right-5 bottom-5 px2 py1 flex justify-center items-center>
        {{ imageAlt }}
      </div>
    </div>
  </Transition>
</template>

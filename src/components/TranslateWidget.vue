<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isOpen = ref(false)

const languages = [
  { code: 'en', name: 'English (EN)', flag: '🇬🇧' },
  { code: 'zh-CN', name: 'Mandarin Chinese (ZH)', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi (HI)', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (ES)', flag: '🇪🇸' },
  { code: 'ar', name: 'Standard Arabic (AR)', flag: '🇸🇦' },
  { code: 'fr', name: 'French (FR)', flag: '🇫🇷' },
  { code: 'bn', name: 'Bengali (BN)', flag: '🇧🇩' },
  { code: 'pt', name: 'Portuguese (PT)', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian (RU)', flag: '🇷🇺' },
  { code: 'ur', name: 'Urdu (UR)', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian (ID)', flag: '🇮🇩' },
  { code: 'de', name: 'German (DE)', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese (JA)', flag: '🇯🇵' },
  { code: 'pcm', name: 'Nigerian Pidgin (PCM)', flag: '🇳🇬' },
  { code: 'mr', name: 'Marathi (MR)', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati (GU)', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada (KN)', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil (TA)', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu (TE)', flag: '🇮🇳' },
]

function initGoogleTranslate() {
  if ((window as any).googleTranslateElementInit) return

  ;(window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,zh-CN,hi,es,ar,fr,bn,pt,ru,ur,id,de,ja,pcm,mr,gu,kn,ta,te',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      'google_translate_element',
    )
  }

  const script = document.createElement('script')
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.body.appendChild(script)
}

function preventBannerShift() {
  document.body.style.top = '0px'
  const iframe = document.querySelector('iframe.goog-te-banner-frame')
  if (iframe) {
    iframe.remove()
  }
}

onMounted(() => {
  initGoogleTranslate()

  // Prevent Google Translate from adding inline top displacement styling to body
  const observer = new MutationObserver(() => {
    if (document.body.style.top !== '0px') {
      document.body.style.top = '0px'
    }
    const banner = document.querySelector('.goog-te-banner-frame')
    if (banner) {
      banner.remove()
    }
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: true,
    subtree: true,
  })
})

function triggerTranslation(langCode: string) {
  isOpen.value = false

  // Set Google Translate backend cookie
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`
  document.cookie = `googtrans=/en/${langCode}; path=/`

  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
  if (select) {
    select.value = langCode
    select.dispatchEvent(new Event('change'))
  } else {
    window.location.reload()
  }
  preventBannerShift()
}
</script>

<template>
  <div class="relative inline-block text-left print:hidden">
    <!-- Hidden Google Translate Backend Mount -->
    <div id="google_translate_element" class="hidden opacity-0 pointer-events-none w-0 h-0 overflow-hidden" />

    <button
      type="button"
      class="px-2 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1 opacity-75 hover:opacity-100 focus:outline-none"
      title="Translate via Google Translate"
      @click="isOpen = !isOpen"
    >
      <span i-carbon-translate class="text-sm" />
      <span class="lt-md:hidden">Translate</span>
    </button>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/45 backdrop-blur-md"
          @click.self="isOpen = false"
        >
          <div class="relative w-84 bg-base rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 modal-popup-box">
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2.5 mb-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span i-carbon-translate /> Google Translate
              </h4>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-bold border-none! bg-transparent cursor-pointer focus:outline-none"
                @click="isOpen = false"
              >
                ✕
              </button>
            </div>

            <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <button
                v-for="lang in languages"
                :key="lang.code"
                type="button"
                class="w-full px-3 py-2 rounded-lg text-left text-xs font-medium bg-gray-500/5 hover:bg-gray-500/15 transition-colors border-none! cursor-pointer flex items-center justify-between text-gray-800 dark:text-gray-200 focus:outline-none"
                @click="triggerTranslation(lang.code)"
              >
                <span class="flex items-center gap-2">
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </span>
                <span class="text-xs opacity-50">Translate ↗</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.goog-te-banner-frame,
iframe.goog-te-banner-frame,
.goog-te-banner-frame.skiptranslate,
#goog-gt-tt,
.goog-te-balloon-frame {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  pointer-events: none !important;
}

body {
  top: 0px !important;
  position: static !important;
}

.goog-te-gadget {
  display: none !important;
}

.goog-text-highlight {
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>

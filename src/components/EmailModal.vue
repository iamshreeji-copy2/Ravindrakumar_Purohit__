<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function sendEmail(type: 'student' | 'personal') {
  closeModal()
  if (type === 'student') {
    window.location.href = 'mailto:202321002@dau.ac.in'
  } else {
    window.location.href = 'mailto:itsravindra.purohit@gmail.com'
  }
}
</script>

<template>
  <span class="inline-block">
    <button
      type="button"
      class="px-3 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-md text-sm border-none! inline-flex items-center gap-1.5 cursor-pointer transition-colors font-medium focus:outline-none"
      title="Contact via Email"
      @click="openModal"
    >
      <span i-ri-mail-fill /> Email
    </button>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md"
          @click.self="closeModal"
        >
          <div
            class="relative w-full max-w-md bg-base rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 modal-popup-box"
          >
            <button
              type="button"
              class="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-none! cursor-pointer transition-colors focus:outline-none"
              aria-label="Close"
              @click="closeModal"
            >
              ✕
            </button>

            <h3 class="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>✉️</span> Select Email Account
            </h3>
            <p class="text-sm opacity-75 mb-5">
              Which email address would you like to contact?
            </p>

            <div class="space-y-3">
              <button
                type="button"
                class="w-full p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-500/5 hover:bg-gray-500/10 text-left transition-all cursor-pointer flex items-center justify-between group text-current focus:outline-none"
                @click="sendEmail('student')"
              >
                <div>
                  <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">Student / Academic Email</div>
                  <div class="text-xs opacity-60 font-mono mt-0.5">202321002&lt;at&gt;dau.ac.in</div>
                </div>
                <span class="text-xs opacity-50 group-hover:opacity-100 transition-opacity">Send ↗</span>
              </button>

              <button
                type="button"
                class="w-full p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-500/5 hover:bg-gray-500/10 text-left transition-all cursor-pointer flex items-center justify-between group text-current focus:outline-none"
                @click="sendEmail('personal')"
              >
                <div>
                  <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">Personal Email</div>
                  <div class="text-xs opacity-60 font-mono mt-0.5">itsravindra.purohit[at]gmail[dot]com</div>
                </div>
                <span class="text-xs opacity-50 group-hover:opacity-100 transition-opacity">Send ↗</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
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

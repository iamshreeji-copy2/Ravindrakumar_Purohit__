<script setup lang="ts">
import { ref } from 'vue'

const activeModal = ref<'short' | 'long' | null>(null)

function openModal(type: 'short' | 'long') {
  activeModal.value = type
}

function closeModal() {
  activeModal.value = null
}
</script>

<template>
  <span class="inline-flex items-center gap-2 my-2">
    <button
      type="button"
      class="px-3 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
      @click="openModal('short')"
    >
      <span i-ri-article-line /> Short Bio
    </button>
    <button
      type="button"
      class="px-3 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
      @click="openModal('long')"
    >
      <span i-ri-file-text-line /> Full / Long Bio
    </button>

    <!-- Modal Subtab Teleport -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="activeModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          @click.self="closeModal"
        >
          <div class="relative w-full max-w-2xl bg-base rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 max-h-[85vh] overflow-y-auto modal-popup-box">
            <!-- Header Controls: Print & Close -->
            <div class="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <PrintButton />
              <button
                type="button"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-none! cursor-pointer transition-colors focus:outline-none"
                aria-label="Close"
                @click="closeModal"
              >
                ✕
              </button>
            </div>

            <!-- Short Bio Modal Content -->
            <div v-if="activeModal === 'short'">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-3 pr-28">
                <span>📋</span> Short Biography
              </h3>
              <p class="text-sm sm:text-base leading-relaxed opacity-90 text-gray-800 dark:text-gray-200 text-justify">
                Ravindrakumar M. Purohit is a Ph.D. candidate at the Speech Research Lab, Dhirubhai Ambani University, Gandhinagar, working under Prof. Hemant A. Patil. His research focuses on speech synthesis, voice conversion, speaker diarization, and audio deepfake detection. He has published in Q1 journals (<em>Cluster Computing</em>) and top conferences including NeurIPS Workshops, IJCNN, EUSIPCO, and ICPR. He is a Google Cloud Research Grant recipient and serves as a reviewer for leading speech and signal processing venues.
              </p>
            </div>

            <!-- Long Bio Modal Content -->
            <div v-if="activeModal === 'long'">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-3 pr-28">
                <span>📖</span> Full Biography
              </h3>
              <div class="space-y-4 text-sm sm:text-base leading-relaxed opacity-90 text-gray-800 dark:text-gray-200 text-justify">
                <p>
                  Ravindrakumar M. Purohit is a Ph.D. Scholar at the Speech Research Lab, Dhirubhai Ambani University (DAU, formerly DA-IICT), Gandhinagar, India. Guided by Prof. Hemant A. Patil, his doctoral research focuses on speech synthesis, voice conversion, speaker diarization, and audio deepfake detection for low-resource Indic languages. He holds an M.Tech. in CSE (Data Science) from Nirma University.
                </p>
                <p>
                  His work has been published in the Q1-ranked <em>Cluster Computing</em> journal, as well as top venues including NeurIPS Workshops, IJCNN 2026, EUSIPCO 2025, ICPR 2024, APSIPA ASC, and PReMI. He is the recipient of a Google Cloud Research Grant and an IndoML Graduate Forum Travel Grant.
                </p>
                <p>
                  Ravindrakumar is an active IEEE member and qualified the UGC-accredited Gujarat State Eligibility Test (GSET) for Assistant Professor. His academic service includes reviewing for Elsevier’s <em>Applied Soft Computing</em> journal, IEEE ICASSP, and IJCNN, as well as serving as a Session Chair at IJCNN 2026.
                </p>
              </div>
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

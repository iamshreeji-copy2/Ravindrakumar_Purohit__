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
      class="px-3 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1.5"
      @click="openModal('short')"
    >
      <span i-ri-article-line /> Short Bio
    </button>
    <button
      type="button"
      class="px-3 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 text-current transition-colors border-none! cursor-pointer inline-flex items-center gap-1.5"
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
          <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 max-h-[85vh] overflow-y-auto modal-popup-box">
            <!-- Header Controls: Print & Close -->
            <div class="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <PrintButton />
              <button
                type="button"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-none! cursor-pointer transition-colors"
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
                Ravindrakumar M. Purohit is a Ph.D. candidate at the Speech Research Lab, Dhirubhai Ambani University, specializing in AI-driven speech and audio signal processing under Prof. Hemant A. Patil. He holds B.Tech. and M.Tech. degrees. His research has appeared in <em>Cluster Computing</em> (Q1), the NeurIPS Workshop, IJCNN 2026, EUSIPCO 2025, ICPR 2024, APSIPA ASC 2024–2025, IALP 2025, and PREMI 2025. He received the Google Cloud Research Grant and IndoML Travel Grant. He reviews for <em>Applied Soft Computing</em> and leading international conferences and served as a session chair at IJCNN 2026.
              </p>
            </div>

            <!-- Long Bio Modal Content -->
            <div v-if="activeModal === 'long'">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-3 pr-28">
                <span>📖</span> Full Biography
              </h3>
              <div class="space-y-4 text-sm sm:text-base leading-relaxed opacity-90 text-gray-800 dark:text-gray-200 text-justify">
                <p>
                  Ravindrakumar M. Purohit is a Ph.D. candidate at the Speech Research Lab, Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar, India. Since August 2023, he has been pursuing his doctoral research under the supervision of Prof. Hemant A. Patil. He received his B.Tech. from Gujarat Technological University and his M.Tech. from Nirma University. His research interests include artificial intelligence, machine learning, deep learning, and speech and audio signal processing.
                </p>
                <p>
                  His research has appeared in <em>Cluster Computing</em>, a Q1 journal, and at prominent international venues, including the NeurIPS Workshop, IJCNN 2026, EUSIPCO 2025, ICPR 2024, APSIPA ASC 2024 and 2025, IALP 2025, and PREMI 2025. In 2025, he received a USD 1,000 Google Cloud Research Grant to develop, train, and deploy advanced speech-processing models on Google Cloud Platform. He also received the IndoML 2025 Travel Grant, with full support to present “NaadSindhu” at the Graduate Forum.
                </p>
                <p>
                  He is an IEEE member affiliated with the Gujarat Section and a lifetime member of the International Association of Engineers. He has also qualified for the UGC-accredited Gujarat State Eligibility Test. His academic service includes reviewing for Elsevier’s <em>Applied Soft Computing</em>, ICASSP 2025, APSIPA ASC 2024 and 2025, and IJCNN 2026. He also served as a session chair at IJCNN 2026. Additionally, he contributed as the webmaster and a volunteer for S4P’25 at DAU, supporting website development, logistics, and documentation.
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

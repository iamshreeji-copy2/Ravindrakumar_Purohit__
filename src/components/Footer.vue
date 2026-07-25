<template>
  <div class="mt-16 mb-8 prose m-auto text-center slide-enter animate-delay-1200! copyright">
    <div class="text-center my-6">
      <h3 class="text-center font-semibold text-lg my-3 opacity-90">📬 Let's Connect!</h3>
      <div class="mt-4 flex flex-wrap justify-center items-center gap-3 print:hidden">
        <a
          href="https://scholar.google.com/citations?user=vLEJ5JEAAAAJ"
          target="_blank"
          class="px-3 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-md text-sm border-none! inline-flex items-center gap-1.5 no-underline! font-medium"
        >
          <span i-ri-graduation-cap-line /> Google Scholar
        </a>
        <a
          href="https://github.com/iamshreeji-copy1"
          target="_blank"
          class="px-3 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-md text-sm border-none! inline-flex items-center gap-1.5 no-underline! font-medium"
        >
          <span i-simple-icons-github /> GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/iamshreeji/?originalSubdomain=in"
          target="_blank"
          class="px-3 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-md text-sm border-none! inline-flex items-center gap-1.5 no-underline! font-medium"
        >
          <span i-ri-linkedin-box-fill /> LinkedIn
        </a>
        <EmailModal />
      </div>
    </div>

    <span class="text-sm opacity-60">
      © 2026 Ravindrakumar M. Purohit. All rights reserved.
    </span>
  </div>
</template>

<style>
.no-copyright ~ .copyright {
  display: none;
}
</style>

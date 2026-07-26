---
title: TTS Experiment
display: TTS WebAssembly Experiment
subtitle: Browser-based speech synthesis using ONNX Runtime
description: Standalone sandbox page for testing client-side VITS TTS model execution.
art: plum
---

<p class="opacity-75 max-w-xl mx-auto text-center mb-8">
This is a standalone sandbox page for testing browser-side speech synthesis using WebAssembly (ONNX Runtime Web) and pre-rendered audio outputs. It is excluded from the navigation menus.
</p>

<!-- Sherpa-ONNX Supertonic 3 Demo Card -->
<div class="border border-blue-500/20 dark:border-blue-400/20 rounded-xl p-5 md:p-6 bg-blue-500/5 backdrop-blur-md max-w-xl mx-auto my-8 text-center slide-enter">
  <div class="flex items-center justify-center gap-2 mb-3">
    <div i-ri:music-2-line class="text-xl text-blue-500" />
    <h3 class="text-lg font-bold">Sherpa-ONNX Supertonic 3 Demo</h3>
    <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 select-none">Pre-rendered (Static)</span>
  </div>
  
  <p class="text-xs opacity-75 mb-4 leading-relaxed max-w-md mx-auto">
    This sample was generated locally on client hardware using Node.js and the 10-speaker <strong>Sherpa-ONNX Supertonic 3</strong> model (int8 quantized).
  </p>

  <div class="flex flex-col items-center gap-3">
    <audio src="/speech.wav" controls class="w-full max-w-md" />
    <span class="text-[10px] opacity-50 font-mono">Source text: "How are you doing today? This is a text-to-speech engine using next generation Kaldi."</span>
  </div>
</div>

<TTSPlayground />

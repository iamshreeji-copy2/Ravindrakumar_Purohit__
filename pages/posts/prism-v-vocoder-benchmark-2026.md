---
title: "PRISM-V: A Multidimensional Evaluation of Pretrained Neural Vocoders for Speech Synthesis"
date: "2026-09-05"
lang: en
duration: 6 min
subtitle: Releasing PRISM-V — an open leaderboard for multidimensional evaluation of 15 pretrained neural vocoder architectures across 4 diverse English speech corpora.
description: PRISM-V is an open leaderboard for multidimensional evaluation of pretrained neural vocoders on English speech across diverse acoustic conditions, generative architectures, and edge deployment profiles.
---

<p class="opacity-60 -mt-2 mb-6 text-sm">
Written by <a href="/">Ravindrakumar M. Purohit</a> · September 2026
</p>

<img
  src="/posts/prism-v-vocoder-benchmark-2026/prism-v-logo.png"
  alt="PRISM-V Open Leaderboard for Neural Vocoder Evaluation"
  style="width: 100%; border-radius: 12px; margin: 0 0 2rem 0;"
/>

We are releasing <strong><span style="color:#6366f1">P</span><span style="color:#06b6d4">R</span><span style="color:#10b981">I</span><span style="color:#f59e0b">S</span><span style="color:#f43f5e">M</span>-V</strong> — an open leaderboard for multidimensional evaluation of pretrained neural vocoders on English speech.

---

### Why Another Vocoder Benchmark?

Traditional neural vocoder evaluations predominantly report PESQ and MCD exclusively on clean, single-speaker studio recordings (e.g., LJSpeech). In production speech synthesis and voice conversion, however, practitioners deploy models on diverse voices, accented speech, and real-world noisy audio — often across hardware constrained to sub-realtime latencies.

<strong><span style="color:#6366f1">P</span><span style="color:#06b6d4">R</span><span style="color:#10b981">I</span><span style="color:#f59e0b">S</span><span style="color:#f43f5e">M</span>-V</strong> fills this gap with a comprehensive, reproducible evaluation framework covering:

| Dimension                                                                       |
| ------------------------------------------------------------------------------- |
| <strong><span style="color:#6366f1">P</span></strong> — Perceptual Quality      |
| <strong><span style="color:#06b6d4">R</span></strong> — Reconstruction Fidelity |
| <strong><span style="color:#10b981">I</span></strong> — Intelligibility         |
| <strong><span style="color:#f59e0b">S</span></strong> — Spectral Accuracy       |
| <strong><span style="color:#f43f5e">M</span></strong> — Machine Throughput      |

---

<div style="display: flex; flex-direction: column; align-items: center; gap: 0; margin: 2rem auto; max-width: 480px; font-family: ui-monospace, monospace;">
  <div style="background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0.65rem 1.4rem; font-size: 0.95rem; font-weight: 600; color: #1e293b; text-align: center; width: 100%;">
    🎵 Ground-Truth Audio
  </div>
  <div style="font-size: 1.5rem; color: #64748b; line-height: 1; margin: 4px 0;">↓</div>
  <div style="background: #ede9fe; border: 1.5px solid #a78bfa; border-radius: 8px; padding: 0.65rem 1.4rem; font-size: 0.95rem; font-weight: 600; color: #4c1d95; text-align: center; width: 100%;">
    🔊 Mel-Spectrogram Extraction <span style="font-weight:400; font-size:0.85rem;">(standard filterbank)</span>
  </div>
  <div style="font-size: 1.5rem; color: #64748b; line-height: 1; margin: 4px 0;">↓</div>
  <div style="background: #cffafe; border: 1.5px solid #22d3ee; border-radius: 8px; padding: 0.65rem 1.4rem; font-size: 0.95rem; font-weight: 600; color: #164e63; text-align: center; width: 100%;">
    🤖 Neural Vocoder <span style="font-weight:400; font-size:0.85rem;">(zero-shot synthesis)</span>
  </div>
  <div style="font-size: 1.5rem; color: #64748b; line-height: 1; margin: 4px 0;">↓</div>
  <div style="background: #dcfce7; border: 1.5px solid #4ade80; border-radius: 8px; padding: 0.65rem 1.4rem; font-size: 0.95rem; font-weight: 600; color: #14532d; text-align: center; width: 100%;">
    📊 <span style="color:#6366f1">P</span><span style="color:#06b6d4">R</span><span style="color:#10b981">I</span><span style="color:#f59e0b">S</span><span style="color:#f43f5e">M</span>-V Scoring <span style="font-weight:400; font-size:0.85rem;">(P · R · I · S · M)</span>
  </div>
  <div style="font-size: 1.5rem; color: #64748b; line-height: 1; margin: 4px 0;">↓</div>
  <div style="background: #fef3c7; border: 1.5px solid #fbbf24; border-radius: 8px; padding: 0.65rem 1.4rem; font-size: 0.95rem; font-weight: 600; color: #78350f; text-align: center; width: 100%;">
    🏆 Composite <span style="color:#6366f1">P</span><span style="color:#06b6d4">R</span><span style="color:#10b981">I</span><span style="color:#f59e0b">S</span><span style="color:#f43f5e">M</span>-V Score → Leaderboard Ranking
  </div>
</div>

---

### Live Leaderboard

Explore the full interactive leaderboard with Plotly visualizations, per-corpus breakdowns, radar charts, and audio sample comparisons:

**🔗 [Open Vocoder Leaderboard — PRISM-V](https://iamshreeji-copy2.github.io/open_vocoder_leaderboard/)**

The leaderboard will be updated continuously as new pretrained models are submitted. If you have a vocoder model and want it evaluated, open a pull request or raise an issue in the GitHub repository.

---

### Citation

If <strong><span style="color:#6366f1">P</span><span style="color:#06b6d4">R</span><span style="color:#10b981">I</span><span style="color:#f59e0b">S</span><span style="color:#f43f5e">M</span>-V</strong> is useful for your research, please cite:

```bibtex
@misc{purohit2026prismv,
  author       = {Ravindrakumar M. Purohit and Hemant A. Patil},
  title        = {PRISM-V: A Multidimensional Evaluation of Pretrained Neural Vocoders for Speech Synthesis},
  year         = {2026},
  howpublished = {\url{https://iamshreeji-copy2.github.io/open_vocoder_leaderboard/}},
  note         = {Open neural vocoder evaluation leaderboard}
}
```

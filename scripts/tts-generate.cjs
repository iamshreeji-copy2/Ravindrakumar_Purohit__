const path = require('path');
const sherpa_onnx = require('sherpa-onnx-node');

function createOfflineTts() {
  const modelDir = path.join(__dirname, '../public/models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11');
  const config = {
    model: {
      supertonic: {
        durationPredictor: path.join(modelDir, 'duration_predictor.int8.onnx'),
        textEncoder: path.join(modelDir, 'text_encoder.int8.onnx'),
        vectorEstimator: path.join(modelDir, 'vector_estimator.int8.onnx'),
        vocoder: path.join(modelDir, 'vocoder.int8.onnx'),
        ttsJson: path.join(modelDir, 'tts.json'),
        unicodeIndexer: path.join(modelDir, 'unicode_indexer.bin'),
        voiceStyle: path.join(modelDir, 'voice.bin'),
      },
      debug: true,
      numThreads: 2,
      provider: 'cpu',
    },
  };
  return new sherpa_onnx.OfflineTts(config);
}

console.log('Initializing Sherpa-ONNX Supertonic 3 TTS engine...');
const tts = createOfflineTts();

const text = 'How are you doing today? This is a text-to-speech engine using next generation Kaldi.';
console.log(`Input Text: "${text}"`);

const generationConfig = new sherpa_onnx.GenerationConfig({
  sid: 0,
  numSteps: 8,
  speed: 1.0,
  extra: { lang: 'en' },
});

console.log('Generating speech (WASM/Node runtime)...');
let start = Date.now();
const audio = tts.generate({ text, generationConfig });
let stop = Date.now();

const elapsed_seconds = (stop - start) / 1000;
const duration = audio.samples.length / audio.sampleRate;
const real_time_factor = elapsed_seconds / duration;

console.log('--- Synthesis Report ---');
console.log('Wave duration:', duration.toFixed(3), 'seconds');
console.log('Elapsed calculation time:', elapsed_seconds.toFixed(3), 'seconds');
console.log(`Real Time Factor (RTF): ${elapsed_seconds.toFixed(3)}/${duration.toFixed(3)} =`, real_time_factor.toFixed(3));

const outputFilename = path.join(__dirname, '../public/speech.wav');
sherpa_onnx.writeWave(
  outputFilename, 
  { samples: audio.samples, sampleRate: audio.sampleRate }
);

console.log(`\nSuccess! Saved output wave to: ${outputFilename}`);

<script setup lang='ts'>
import type { Fn } from '@vueuse/core'

const r180 = Math.PI
const r90 = Math.PI / 2
const r15 = Math.PI / 12

const el = ref<HTMLCanvasElement | null>(null)

const { random } = Math
const size = reactive(useWindowSize())

const MIN_BRANCH = 30
const len = ref(6)

function initCanvas(canvas: HTMLCanvasElement, width = 400, height = 400, _dpi?: number) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  // @ts-expect-error vendor
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
  const dpi = _dpi || dpr / bsr

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = dpi * width
  canvas.height = dpi * height
  ctx.scale(dpi, dpi)

  return { ctx, dpi }
}

function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
  const dx = r * Math.cos(theta)
  const dy = r * Math.sin(theta)
  return [x + dx, y + dy]
}

interface TreeController {
  id: number
  steps: Fn[]
  prevSteps: Fn[]
  state: 'WAITING' | 'GROWING' | 'HOLDING' | 'FADING'
  opacity: number
  waitFrames: number
  holdFrames: number
  fadeFrames: number
  maxFadeFrames: number
  side: number // 0: Top, 1: Bottom, 2: Left, 3: Right
  offCanvas: HTMLCanvasElement
  offCtx: CanvasRenderingContext2D
}

onMounted(async () => {
  const mainCanvas = el.value!
  if (!mainCanvas) return
  const { ctx: mainCtx } = initCanvas(mainCanvas, size.width, size.height)

  const MAX_TOTAL_VISIBLE = 2
  const MAX_PER_SIDE = 2

  const createTree = (id: number): TreeController => {
    const offCanvas = document.createElement('canvas')
    const { ctx: offCtx } = initCanvas(offCanvas, size.width, size.height)

    return {
      id,
      steps: [],
      prevSteps: [],
      state: 'WAITING',
      opacity: 0,
      waitFrames: id * 90 + Math.floor(random() * 60), // Staggered initial spawn
      holdFrames: 0,
      fadeFrames: 0,
      maxFadeFrames: 150 + Math.floor(random() * 150),
      side: -1,
      offCanvas,
      offCtx,
    }
  }

  // Pool of tree controllers
  const trees: TreeController[] = [createTree(0), createTree(1), createTree(2), createTree(3)]

  const getActiveTrees = () => trees.filter(t => t.state !== 'WAITING' && t.opacity > 0)
  const getActiveCountForSide = (side: number) => trees.filter(t => t.state !== 'WAITING' && t.side === side).length

  const startTreeGrowth = (tree: TreeController) => {
    // Pick side ensuring max per side limit
    const availableSides: number[] = []
    for (let s = 0; s < 4; s++) {
      if (getActiveCountForSide(s) < MAX_PER_SIDE) {
        availableSides.push(s)
      }
    }

    if (availableSides.length === 0) return false

    const chosenSide = availableSides[Math.floor(random() * availableSides.length)]
    tree.side = chosenSide

    tree.offCtx.clearRect(0, 0, size.width, size.height)
    tree.offCtx.lineWidth = 1
    tree.offCtx.strokeStyle = '#88888835'
    tree.opacity = 1.0
    tree.state = 'GROWING'
    tree.prevSteps = []

    const step = (x: number, y: number, rad: number, counter: { value: number } = { value: 0 }) => {
      const length = random() * len.value
      counter.value += 1

      const [nx, ny] = polar2cart(x, y, length, rad)

      tree.offCtx.beginPath()
      tree.offCtx.moveTo(x, y)
      tree.offCtx.lineTo(nx, ny)
      tree.offCtx.stroke()

      const rad1 = rad + random() * r15
      const rad2 = rad - random() * r15

      if (nx < -100 || nx > size.width + 100 || ny < -100 || ny > size.height + 100)
        return

      const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5

      if (random() < rate)
        tree.steps.push(() => step(nx, ny, rad1, counter))

      if (random() < rate)
        tree.steps.push(() => step(nx, ny, rad2, counter))
    }

    let sx = 0
    let sy = 0
    let srad = 0
    const angleVariation = (random() - 0.5) * (Math.PI / 3)

    if (chosenSide === 0) {
      sx = random() * size.width
      sy = -5
      srad = r90 + angleVariation
    } else if (chosenSide === 1) {
      sx = random() * size.width
      sy = size.height + 5
      srad = -r90 + angleVariation
    } else if (chosenSide === 2) {
      sx = -5
      sy = random() * size.height
      srad = 0 + angleVariation
    } else {
      sx = size.width + 5
      sy = random() * size.height
      srad = r180 + angleVariation
    }

    tree.steps = [() => step(sx, sy, srad)]
    return true
  }

  let lastTime = performance.now()
  const interval = 1000 / 30

  const frame = () => {
    if (performance.now() - lastTime < interval)
      return

    lastTime = performance.now()

    mainCtx.clearRect(0, 0, size.width, size.height)

    trees.forEach((tree) => {
      if (tree.state === 'WAITING') {
        tree.waitFrames--
        // Strictly enforce MAX 2 TOTAL VISIBLE GRAPHICS AT ANY MOMENT
        if (tree.waitFrames <= 0 && getActiveTrees().length < MAX_TOTAL_VISIBLE) {
          const started = startTreeGrowth(tree)
          if (!started) {
            tree.waitFrames = 30
          }
        }
      } else if (tree.state === 'GROWING') {
        tree.prevSteps = tree.steps
        tree.steps = []

        if (!tree.prevSteps.length) {
          tree.state = 'HOLDING'
          tree.holdFrames = 90 + Math.floor(random() * 120)
        } else {
          tree.prevSteps.forEach((i) => {
            if (random() < 0.25)
              tree.steps.push(i)
            else
              i()
          })
        }
      } else if (tree.state === 'HOLDING') {
        tree.holdFrames--
        if (tree.holdFrames <= 0) {
          tree.state = 'FADING'
          tree.fadeFrames = 0
          tree.maxFadeFrames = 180 + Math.floor(random() * 120)
        }
      } else if (tree.state === 'FADING') {
        tree.fadeFrames++
        tree.opacity = Math.max(0, 1 - tree.fadeFrames / tree.maxFadeFrames)

        if (tree.fadeFrames >= tree.maxFadeFrames) {
          tree.state = 'WAITING'
          tree.side = -1
          tree.waitFrames = 60 + Math.floor(random() * 120)
        }
      }

      if (tree.opacity > 0) {
        mainCtx.save()
        mainCtx.globalAlpha = tree.opacity
        mainCtx.drawImage(tree.offCanvas, 0, 0)
        mainCtx.restore()
      }
    })
  }

  useRafFn(frame)
})

const mask = computed(() => 'radial-gradient(circle, transparent, black);')
</script>

<template>
  <div
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden"
    style="z-index: -1"
    :style="`mask-image: ${mask};--webkit-mask-image: ${mask};`"
  >
    <canvas
      ref="el"
      width="400"
      height="400"
      class="w-full h-full"
    />
  </div>
</template>

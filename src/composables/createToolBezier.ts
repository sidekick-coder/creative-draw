import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent, LayerPointEvent, LayerTouchEvent } from './createLayer'
import { defineObjectRender } from './defineObjectRender'

interface Point {
    x: number
    y: number
}

interface BezierSegment {
    c1: Point
    c2: Point
    end: Point
}

/**
 * Each anchor stores its position and outgoing control point (handle).
 * When cp === pos the anchor is a corner (no handle drag).
 * The incoming control point for any segment is the mirror: 2*pos - cp.
 */
interface Anchor {
    pos: Point
    cp: Point
}

/** Phase of the interaction state machine. */
type Phase = 'idle' | 'placing' | 'between'

interface CreateToolBezierOptions {
    board: Board
    active?: MaybeRef<boolean>
}

export function useBezierToolOptions(board: Board) {
    const size = board.context.ref('tools:shared:size', 10)
    const opacity = board.context.ref('tools:shared:opacity', 1)
    const color = board.context.ref('tools:shared:color', { r: 0, g: 0, b: 0 })

    return { size, opacity, color }
}

function mirrorOf(anchor: Anchor): Point {
    return {
        x: 2 * anchor.pos.x - anchor.cp.x,
        y: 2 * anchor.pos.y - anchor.cp.y,
    }
}

function computeSegmentsFromAnchors(anchors: Anchor[]): BezierSegment[] {
    if (anchors.length < 2) return []

    return anchors.slice(0, -1).map((a, i) => {
        const next = anchors[i + 1]
        return {
            c1: { ...a.cp },
            c2: mirrorOf(next),
            end: { ...next.pos },
        }
    })
}

function drawBezierPath(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    start: Point,
    segments: BezierSegment[],
    color: { r: number; g: number; b: number },
    strokeWidth: number,
    opacity: number
) {
    ctx.globalAlpha = opacity
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)

    for (const seg of segments) {
        ctx.bezierCurveTo(seg.c1.x, seg.c1.y, seg.c2.x, seg.c2.y, seg.end.x, seg.end.y)
    }

    ctx.stroke()
    ctx.globalAlpha = 1
}

/** Small diamond (rotated square) for anchor nodes. */
function drawAnchorNode(ctx: CanvasRenderingContext2D, p: Point, isActive: boolean) {
    const s = 5
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(Math.PI / 4)
    ctx.beginPath()
    ctx.rect(-s, -s, s * 2, s * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = isActive ? '#4a90d9' : '#888888'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
}

/** Small circle for control point (handle) nodes. */
function drawControlNode(ctx: CanvasRenderingContext2D, p: Point) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#4a90d9'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
}

/** Dashed line connecting an anchor to its handle and the mirror handle. */
function drawHandleLine(ctx: CanvasRenderingContext2D, anchor: Anchor) {
    const mirror = mirrorOf(anchor)
    const hasDrag = anchor.cp.x !== anchor.pos.x || anchor.cp.y !== anchor.pos.y

    if (!hasDrag) return

    ctx.save()
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = '#4a90d9'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.moveTo(mirror.x, mirror.y)
    ctx.lineTo(anchor.cp.x, anchor.cp.y)
    ctx.stroke()
    ctx.restore()

    drawControlNode(ctx, anchor.cp)
    drawControlNode(ctx, mirror)
}

const render = defineObjectRender({
    name: 'bezier',
    render({ ctx, item }) {
        drawBezierPath(ctx, item.start, item.segments, item.color, item.strokeWidth ?? 2, item.opacity ?? 1)
    },
})

export function createToolBezier(options: CreateToolBezierOptions) {
    const active = toRef(options.active ?? false)
    const { size, opacity, color } = useBezierToolOptions(options.board)

    let phase: Phase = 'idle'
    let anchors: Anchor[] = []
    let cursorPos: Point | null = null

    let overlayCanvas: HTMLCanvasElement | null = null
    let overlayCtx: CanvasRenderingContext2D | null = null

    let device: 'mouse' | 'pointer' | 'touch' | null = null
    let activePointerId: number | null = null
    let lastMouseDownTime = 0

    let currentLayer: Layer | null = null

    function ensureOverlay(board: Board) {
        if (overlayCanvas) return

        const container = board.context.get<HTMLElement>('container')

        overlayCanvas = document.createElement('canvas')
        overlayCanvas.style.position = 'absolute'
        overlayCanvas.style.pointerEvents = 'none'
        overlayCanvas.style.zIndex = '9999'
        overlayCanvas.style.display = 'none'

        container.appendChild(overlayCanvas)
        overlayCtx = overlayCanvas.getContext('2d')!
    }

    function syncOverlay(layerCanvas: HTMLCanvasElement) {
        if (!overlayCanvas) return

        overlayCanvas.width = layerCanvas.width
        overlayCanvas.height = layerCanvas.height
        overlayCanvas.style.left = layerCanvas.style.left
        overlayCanvas.style.top = layerCanvas.style.top
    }

    function drawPreview() {
        if (!overlayCtx || !overlayCanvas || phase === 'idle') return

        const ctx = overlayCtx
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

        // committed segments
        if (anchors.length >= 2) {
            const segments = computeSegmentsFromAnchors(anchors)
            drawBezierPath(ctx, anchors[0].pos, segments, color.value, size.value, opacity.value)
        }

        // tentative segment from last anchor to cursor (only while waiting for next click)
        if (phase === 'between' && cursorPos && anchors.length >= 1) {
            const last = anchors[anchors.length - 1]
            ctx.save()
            ctx.globalAlpha = opacity.value * 0.5
            ctx.strokeStyle = `rgb(${color.value.r}, ${color.value.g}, ${color.value.b})`
            ctx.lineWidth = size.value
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(last.pos.x, last.pos.y)
            ctx.bezierCurveTo(last.cp.x, last.cp.y, cursorPos.x, cursorPos.y, cursorPos.x, cursorPos.y)
            ctx.stroke()
            ctx.restore()
        }

        // handle line for last anchor (shows confirmed handle after mouseup)
        if (anchors.length >= 1) {
            const last = anchors[anchors.length - 1]
            drawHandleLine(ctx, last)
        }

        // anchor nodes for all committed anchors
        for (let i = 0; i < anchors.length; i++) {
            drawAnchorNode(ctx, anchors[i].pos, i === anchors.length - 1)
        }
    }

    function cancel() {
        phase = 'idle'
        anchors = []
        cursorPos = null
        currentLayer = null
        device = null

        if (overlayCtx && overlayCanvas) {
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
            overlayCanvas.style.display = 'none'
        }
    }

    function commitPath(ctx: OffscreenCanvasRenderingContext2D, layer: Layer) {
        if (anchors.length < 2) {
            cancel()
            return
        }

        const segments = computeSegmentsFromAnchors(anchors)

        const item = {
            id: createId(),
            type: 'bezier',
            start: { ...anchors[0].pos },
            segments,
            color: { ...color.value },
            strokeWidth: size.value,
            opacity: opacity.value,
        }

        drawBezierPath(ctx, item.start, item.segments, item.color, item.strokeWidth, item.opacity)
        layer.add(item)

        cancel()
    }

    function onKeyDown(e: KeyboardEvent) {
        if (phase === 'idle' || !active.value) return

        if (e.key === 'Escape') {
            cancel()
            return
        }

        if (e.key === 'Enter' && currentLayer) {
            const ctx = currentLayer.context.get<OffscreenCanvasRenderingContext2D>('context')
            commitPath(ctx, currentLayer)
        }
    }

    return defineBoardPlugin({
        active,
        size,
        opacity,
        color,
        render,
        install(board: Board) {
            board.renders.set('bezier', render)

            document.addEventListener('keydown', onKeyDown)

            board.emitter.on('layer:added', (layer: Layer) => {
                function handleDown(
                    layerCanvas: HTMLCanvasElement,
                    ctx: OffscreenCanvasRenderingContext2D,
                    x: number,
                    y: number
                ) {
                    const now = Date.now()
                    const isDoubleClick = phase === 'between' && now - lastMouseDownTime < 300
                    lastMouseDownTime = now

                    if (isDoubleClick) {
                        commitPath(ctx, layer)
                        return
                    }

                    if (phase === 'idle') {
                        ensureOverlay(board)
                        syncOverlay(layerCanvas)
                        currentLayer = layer
                        if (overlayCanvas) overlayCanvas.style.display = 'block'
                    }

                    // Add a new anchor at click position; cp starts at pos (no handle yet)
                    anchors.push({ pos: { x, y }, cp: { x, y } })
                    phase = 'placing'
                    drawPreview()
                }

                function handleMove(x: number, y: number) {
                    if (phase === 'placing' && anchors.length > 0) {
                        // Drag updates the outgoing handle of the last anchor
                        anchors[anchors.length - 1].cp = { x, y }
                        drawPreview()
                    } else if (phase === 'between') {
                        cursorPos = { x, y }
                        drawPreview()
                    }
                }

                function handleUp(ctx: OffscreenCanvasRenderingContext2D, x: number, y: number) {
                    if (phase !== 'placing') return
                    anchors[anchors.length - 1].cp = { x, y }
                    phase = 'between'
                    drawPreview()
                }

                // mouse
                layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                    if (!active.value) return
                    if (device && device !== 'mouse') return
                    device = 'mouse'
                    handleDown(e.ctx.canvas as unknown as HTMLCanvasElement, e.ctx, e.x, e.y)
                })

                layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                    if (!active.value || phase === 'idle' || device !== 'mouse') return
                    handleMove(e.x, e.y)
                })

                layer.emitter.on('mouseup', (e: LayerMouseEvent) => {
                    if (device !== 'mouse') return
                    handleUp(e.ctx, e.x, e.y)
                })

                // pen
                layer.emitter.on('pointerdown', (e: LayerPointEvent) => {
                    if (!active.value) return
                    if (e.event.pointerType !== 'pen') return
                    if (device && device !== 'pointer') return
                    device = 'pointer'
                    activePointerId = e.event.pointerId
                    handleDown(e.ctx.canvas as unknown as HTMLCanvasElement, e.ctx, e.x, e.y)
                })

                layer.emitter.on('pointermove', (e: LayerPointEvent) => {
                    if (!active.value || phase === 'idle' || device !== 'pointer') return
                    if (e.event.pointerId !== activePointerId) return
                    handleMove(e.x, e.y)
                })

                layer.emitter.on('pointerup', (e: LayerPointEvent) => {
                    if (device !== 'pointer' || e.event.pointerId !== activePointerId) return
                    handleUp(e.ctx, e.x, e.y)
                })

                layer.emitter.on('pointercancel', (e: LayerPointEvent) => {
                    if (e.event.pointerId !== activePointerId) return
                    cancel()
                    activePointerId = null
                })

                layer.emitter.on('lostpointercapture', (e: LayerPointEvent) => {
                    if (e.event.pointerId !== activePointerId) return
                    cancel()
                    activePointerId = null
                })

                // touch
                layer.emitter.on('touchstart', (e: LayerTouchEvent) => {
                    if (!active.value) return
                    if (device && device !== 'touch') return
                    if (e.event.touches.length !== 1) return
                    e.event.preventDefault()
                    device = 'touch'
                    handleDown(e.ctx.canvas as unknown as HTMLCanvasElement, e.ctx, e.x, e.y)
                })

                layer.emitter.on('touchmove', (e: LayerTouchEvent) => {
                    if (!active.value || phase === 'idle' || device !== 'touch') return
                    if (e.event.touches.length !== 1) return
                    handleMove(e.x, e.y)
                })

                layer.emitter.on('touchend', (e: LayerTouchEvent) => {
                    if (device !== 'touch') return
                    handleUp(e.ctx, e.x, e.y)
                })
            })
        },
    })
}

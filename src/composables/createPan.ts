import type { Board } from './createBoard'

interface CreatePanOptions {
    active?: MaybeRef<boolean>
    debug?: boolean
}

export function createPan(options: CreatePanOptions = {}) {
    let board: Board
    let container: HTMLElement
    const grabbler = document.createElement('div')
    const active = toRef(options.active ?? false)

    const panning = ref(false)
    const x = ref(0)
    const y = ref(0)

    let lastMouseX = 0
    let lastMouseY = 0

    grabbler.id = 'grabbler'
    grabbler.classList.add('absolute', 'inset-0', 'cursor-grab', 'bg-red-500', 'opacity-0')
    grabbler.style.touchAction = 'none'

    function attach() {
        const isAttached = document.body.contains(grabbler)

        if (isAttached) return

        if (options.debug) console.debug('[pan] attach')

        document.body.appendChild(grabbler)
    }

    function detach() {
        if (options.debug) console.debug('[pan] detach')

        if (grabbler.parentElement) {
            grabbler.parentElement.removeChild(grabbler)
        }
    }

    function toggle() {
        active.value = !active.value
    }

    watch(active, (isActive) => (isActive ? attach() : detach()), { immediate: true })

    function setPosition() {
        container.style.marginLeft = `${x.value}px`
        container.style.marginTop = `${y.value}px`
    }

    function reset() {
        if (options.debug) console.debug('[pan] reset')

        x.value = 0
        y.value = 0
    }

    function start(event: PointerEvent) {
        if (panning.value) return

        event.preventDefault()
        event.stopPropagation()

        lastMouseX = event.clientX
        lastMouseY = event.clientY

        panning.value = true

        if (options.debug) console.debug('[pan] start')
    }

    function move(event: PointerEvent) {
        if (!panning.value) return

        const newX = x.value + event.clientX - lastMouseX
        const newY = y.value + event.clientY - lastMouseY

        lastMouseX = event.clientX
        lastMouseY = event.clientY

        x.value = newX
        y.value = newY
    }

    function end() {
        panning.value = false
    }

    grabbler.addEventListener('pointerdown', start)
    grabbler.addEventListener('pointermove', move)
    grabbler.addEventListener('pointerup', end)
    grabbler.addEventListener('pointercancel', end)

    return defineBoardPlugin(
        reactive({
            reset,
            toggle,
            active,
            install(_board) {
                board = _board

                container = board.context.get<HTMLElement>('container')

                watch([x, y], setPosition, { immediate: true })

                // attach grap when press ctrl + space
                onHotKey('ctrl+space', () => (active.value = true))

                // detach grap when release ctrl or space
                document.addEventListener('keyup', function (event) {
                    if (event.ctrlKey || event.code === 'Space') {
                        end()
                        active.value = false
                    }
                })
            },
        })
    )
}

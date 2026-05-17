import type { Board } from './createBoard'

interface CreateShapeOptions {
    active?: MaybeRef<boolean>
    debug?: boolean
}

export function createRect(options: CreateShapeOptions = {}) {
    let board: Board
    const overlay = document.createElement('div')
    const active = toRef(options.active ?? false)

    overlay.id = 'rect-overlay'
    overlay.classList.add('absolute', 'inset-0', 'cursor-crosshair', 'bg-transparent', 'opacity-0')
    overlay.style.touchAction = 'none'

    function attach() {
        const isAttached = document.body.contains(overlay)

        if (isAttached) return

        if (options.debug) console.debug('[rect] attach')

        document.body.appendChild(overlay)
    }

    function detach() {
        if (options.debug) console.debug('[rect] detach')

        if (overlay.parentElement) {
            overlay.parentElement.removeChild(overlay)
        }
    }

    function toggle() {
        active.value = !active.value
    }

    watch(active, (isActive) => (isActive ? attach() : detach()), { immediate: true })

    return defineBoardPlugin(
        reactive({
            toggle,
            active,
            install(_board: Board) {
                board = _board
            },
        })
    )
}

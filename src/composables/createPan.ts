import type { Board } from './createBoard'

interface CreatePanOptions {
    debug?: boolean
}

export function createPan(options: CreatePanOptions = {}) {
    let board: Board
    let container: HTMLElement
    const grabbler = document.createElement('div')

    const panning = ref(false)
    const x = ref(0)
    const y = ref(0)

    let lastMouseX = 0
    let lastMouseY = 0

    grabbler.id = 'grabbler'
    grabbler.classList.add('absolute', 'inset-0', 'cursor-grab', 'bg-red-500', 'opacity-0')

    function setPosition() {
        container.style.marginLeft = `${x.value}px`
        container.style.marginTop = `${y.value}px`
    }

    function reset() {
        if (options.debug) console.debug('[pan] reset')

        x.value = 0
        y.value = 0
    }

    function start(event: MouseEvent) {
        if (panning.value) return

        event.preventDefault()
        event.stopPropagation()

        lastMouseX = event.clientX
        lastMouseY = event.clientY

        panning.value = true

        if (options.debug) console.debug('[pan] start')
    }

    function move(event: MouseEvent) {
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

    grabbler.addEventListener('mousedown', start)
    grabbler.addEventListener('mousemove', move)
    grabbler.addEventListener('mouseup', end)

    return defineBoardPlugin({
        reset,
        install(_board) {
            board = _board

            container = board.context.get<HTMLElement>('container')

            watch([x, y], setPosition, { immediate: true })

            // attach grap when press ctrl + space
            onHotKey('ctrl+space', attach)

            // detach grap when release ctrl or space
            document.addEventListener('keyup', function (event) {
                if (event.ctrlKey || event.code === 'Space') {
                    detach()
                }
            })
        },
    })
}

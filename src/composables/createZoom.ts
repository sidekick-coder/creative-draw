import type { Board } from './createBoard'

export function createZoom() {
    let board: Board

    const scale = ref(0.5)

    function resize() {
        const container = board.context.get('container')

        if (!container) {
            return
        }

        container.style.transform = `scale(${scale.value})`
    }

    return defineBoardPlugin(
        reactive({
            scale,
            install(_board) {
                board = _board

                watch(scale, resize, { immediate: true })
            },
        })
    )
}

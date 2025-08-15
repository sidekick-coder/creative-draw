import type { Board, BoardLayerSetEvent } from './createBoard'
import type { LayerObject } from './createLayer'

interface Stack {
    do: () => void
    undo: () => void
}

interface Options {
    debug?: boolean
}

export function createHistory(options: Options = {}) {
    let board: Board
    const undoStack = ref([] as Stack[])
    const redoStack = ref([] as Stack[])
    let executing = false

    function undo() {
        const command = undoStack.value.pop()
        if (!command) return
        command.undo()
        redoStack.value.push(command)
    }

    function redo() {
        const command = redoStack.value.pop()
        if (!command) return
        command.do()
        undoStack.value.push(command)
    }

    return defineBoardPlugin({
        undo,
        redo,
        redoStack,
        undoStack,
        install(_board) {
            board = _board

            board.emitter.on(
                'layer:set:data',
                ({ value, layer }: BoardLayerSetEvent<LayerObject[]>) => {
                    if (executing) return

                    if (!value.length) return
                    const current = JSON.parse(JSON.stringify(value.at(-1)))

                    console.log('Current layer:', current)

                    const stack: Stack = {
                        do: () => {
                            executing = true

                            layer.add(current)

                            layer.redraw()

                            executing = false
                        },
                        undo: () => {
                            executing = true

                            layer.remove(current.id)

                            layer.redraw()

                            executing = false
                        },
                    }

                    undoStack.value.push(stack)
                    redoStack.value.length = 0 // Clear redo stack on new action
                }
            )

            board.emitter.on('history:undo', undo)

            board.emitter.on('history:redo', redo)
        },
    })
}

import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import debounce from 'lodash/debounce'

export interface Snapshot {
    timestamp: number
    data: Map<string, any[]>
}

export function createHistory() {
    let board: Board
    let appling = false
    const undoStack = [] as Snapshot[]
    const redoStack = [] as Snapshot[]

    function snapshot() {
        const data = new Map<string, any[]>()

        board.layers.forEach((layer) => {
            data.set(layer.id, structuredClone(layer.get('data')))
        })

        return {
            timestamp: Date.now(),
            data,
        }
    }

    function commit() {
        if (appling) return

        const current = snapshot()

        undoStack.push(current)

        if (undoStack.length > 10) {
            undoStack.shift()
        }

        redoStack.length = 0
    }

    function apply(snapshot: Snapshot) {
        appling = true

        const layers = Array.from(snapshot.data.entries())

        for (const [id, data] of layers) {
            const layer = board.layers.find((layer) => layer.id === id)

            if (!layer) continue

            layer.set('data', data)

            layer.emitter.emit('render')
        }

        appling = false
    }

    function undo() {
        if (undoStack.length <= 1) return

        const current = undoStack.pop()

        redoStack.push(current!)

        const previous = undoStack[undoStack.length - 1]

        apply(previous)
    }

    function redo() {
        const next = redoStack.pop()

        if (!next) return

        undoStack.push(next)

        apply(next)
    }

    return defineBoardPlugin({
        undo,
        redo,
        install(_board) {
            board = _board

            board.emitter.on('layer:set:data', commit)

            board.emitter.on('history:undo', undo)

            board.emitter.on('history:redo', redo)
        },
    })
}

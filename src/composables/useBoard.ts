import { createBoard, type Board } from './createBoard.ts'

const key = Symbol('board') as InjectionKey<Board>

export function useBoard() {
    let board = inject(key, null)

    if (!board) {
        board = createBoard()

        provide(key, board)

        return board
    }

    return board
}

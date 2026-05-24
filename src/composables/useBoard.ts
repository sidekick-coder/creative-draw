import { createBoard, type Board, type CreateBoardOptions } from './createBoard.ts'

const key = Symbol('board') as InjectionKey<Board>

export function createAndProvideBoard(options: CreateBoardOptions = {}) {
    const board = createBoard(options)

    provide(key, board)

    return board
}

export function useBoard() {
    let board = inject(key, null)

    if (!board) {
        board = createBoard()

        provide(key, board)

        return board
    }

    return board
}

import { type Axis3D } from "./RubiksCube"

export class MoveInfo {
    axis: Axis3D
    layer: number[]
    rotations: number
    
    constructor(axis: Axis3D, layer: number[], rotations=1) {
        this.axis = axis
        this.layer = layer
        this.rotations = rotations
    }
}

// https://jperm.net/3x3/moves
export default class Notation {
    moves: string[] 

    static MOVE_MAP = new Map<string, MoveInfo>([
        ['U', new MoveInfo('y', [1], -1)],
        ['D', new MoveInfo('y', [-1], 1)],
        ['R', new MoveInfo('x', [1], -1)],
        ['L', new MoveInfo('x', [-1], 1)],
        ['F', new MoveInfo('z', [1], -1)],
        ['B', new MoveInfo('z', [-1], 1)],
    
        ['Uw', new MoveInfo('y', [0, 1], -1)],
        ['Dw', new MoveInfo('y', [0, -1], 1)],
        ['Rw', new MoveInfo('x', [0, 1], -1)],
        ['Lw', new MoveInfo('x', [0, -1], 1)],
        ['Fw', new MoveInfo('z', [0, 1], -1)],
        ['Bw', new MoveInfo('z', [0, -1], 1)],
    
        ['u', new MoveInfo('y', [0, 1], -1)],
        ['d', new MoveInfo('y', [0, -1], 1)],
        ['r', new MoveInfo('x', [0, 1], -1)],
        ['l', new MoveInfo('x', [0, -1], 1)],
        ['f', new MoveInfo('z', [0, 1], -1)],
        ['b', new MoveInfo('z', [0, -1], 1)],
    
        ['M', new MoveInfo('x', [0], 1)],
        ['E', new MoveInfo('y', [0], 1)],
        ['S', new MoveInfo('z', [0], -1)],
        
        ['U2', new MoveInfo('y', [1], -2)],
        ['D2', new MoveInfo('y', [-1], 2)],
        ['R2', new MoveInfo('x', [1], -2)],
        ['L2', new MoveInfo('x', [-1], 2)],
        ['F2', new MoveInfo('z', [1], -2)],
        ['B2', new MoveInfo('z', [-1], 2)],
    
        ['Uw2', new MoveInfo('y', [0, 1], -2)],
        ['Dw2', new MoveInfo('y', [0, -1], 2)],
        ['Rw2', new MoveInfo('x', [0, 1], -2)],
        ['Lw2', new MoveInfo('x', [0, -1], 2)],
        ['Fw2', new MoveInfo('z', [0, 1], -2)],
        ['Bw2', new MoveInfo('z', [0, -1], 2)],
    
        ['u2', new MoveInfo('y', [0, 1], -2)],
        ['d2', new MoveInfo('y', [0, -1], 2)],
        ['r2', new MoveInfo('x', [0, 1], -2)],
        ['l2', new MoveInfo('x', [0, -1], 2)],
        ['f2', new MoveInfo('z', [0, 1], -2)],
        ['b2', new MoveInfo('z', [0, -1], 2)],
    
        ['M2', new MoveInfo('x', [0], 2)],
        ['E2', new MoveInfo('y', [0], 2)],
        ['S2', new MoveInfo('z', [0], -2)],

        ["U'", new MoveInfo('y', [1], 1)],
        ["D'", new MoveInfo('y', [-1], -1)],
        ["R'", new MoveInfo('x', [1], 1)],
        ["L'", new MoveInfo('x', [-1], -1)],
        ["F'", new MoveInfo('z', [1], 1)],
        ["B'", new MoveInfo('z', [-1], -1)],
    
        ["Uw'", new MoveInfo('y', [0, 1], 1)],
        ["Dw'", new MoveInfo('y', [0, -1], -1)],
        ["Rw'", new MoveInfo('x', [0, 1], 1)],
        ["Lw'", new MoveInfo('x', [0, -1], -1)],
        ["Fw'", new MoveInfo('z', [0, 1], 1)],
        ["Bw'", new MoveInfo('z', [0, -1], -1)],
    
        ["u'", new MoveInfo('y', [0, 1], 1)],
        ["d'", new MoveInfo('y', [0, -1], -1)],
        ["r'", new MoveInfo('x', [0, 1], 1)],
        ["l'", new MoveInfo('x', [0, -1], -1)],
        ["f'", new MoveInfo('z', [0, 1], 1)],
        ["b'", new MoveInfo('z', [0, -1], -1)],
    
        ["M'", new MoveInfo('x', [0], -1)],
        ["E'", new MoveInfo('y', [0], -1)],
        ["S'", new MoveInfo('z', [0], 1)],
    ])

    static getOppositeMove(move: string) {
        if(!Notation.MOVE_MAP.has(move)) return null

        if(move.search(/M|E|S|w|2/g) === -1) {
            const hasPrime = move.search(`'`)

            if(hasPrime !== -1) {
                return move.replace(/\'/g, '')
            }

            return move + `'`
        }

        return move
    }

    constructor(moves?: string | string[]) {
        this.moves = moves ? this.parseMoves(moves) : []
    }

    clear() {
        this.moves = []
    }

    setMoves(moves: string | string[]) {
        this.moves = this.parseMoves(moves)
    }

    isValid(moves: string | string[]) {
        const movesArray = Array.isArray(moves) ? moves : Array.from(moves.match(/[^\s]+/g) || [])
     
        for(let i = 0; i < movesArray.length; i++) {
            const move = movesArray[i]

            if(!Notation.MOVE_MAP.has(move)) {
                return false
            }
        }

        return true
    }

    parseMoves(moves: string | string[]) {
        const isMovesArray = Array.isArray(moves)
        const movesArray = isMovesArray ? moves : Array.from(moves.match(/[^\s]+/g) || [])

        for(let i = 0; i < movesArray.length; i++) {
            const move = movesArray[i].replace(/\s+/g, '')

            if(!Notation.MOVE_MAP.has(move)) {
                throw new Error(`Invalid move! "${move}"`)
            }
        }

        return movesArray
    }
}
import * as THREE from 'three'
import type Cube from './Cube'
import type { FaceLetters } from './Face'
import Face from './Face'
import Notation from './Notation'
import type RubiksCube from './RubiksCube'

export class BlindSolution {
    edge: {
        moves: FaceLetters[],
        solution: Notation
    }
    corner: {
        moves: FaceLetters[],
        solution: Notation
    }

    moves: FaceLetters[]
    solution: Notation
    parity: boolean

    constructor(edgeMoves: FaceLetters[], edgeSolution: Notation, cornerMoves: FaceLetters[], cornerSolution: Notation) {
        this.edge = {
                moves: edgeMoves,
                solution: edgeSolution
        }

        this.corner = {
            moves: cornerMoves,
            solution: cornerSolution
        }

        this.parity = edgeMoves.length % 2 === 1 && cornerMoves.length % 2 === 1

        if(this.parity) {
            this.solution = Notation.combine(edgeSolution, BlindSolver.PARITY, cornerSolution)
        } else {
            this.solution = Notation.combine(edgeSolution, cornerSolution)
        }
        
        this.moves = [...edgeMoves, ...cornerMoves]
    }

    toString() {
        let edgeString = ''
        let cornerString = ''
        
        for(let i = 0; i < this.edge.moves.length; i+=2) {
            const x = this.edge.moves[i]
            const y = this.edge.moves[i + 1] || ''
            
            edgeString += `${x}${y} `
        }

        for(let i = 0; i < this.corner.moves.length; i+=2) {
            const x = this.corner.moves[i]
            const y = this.corner.moves[i + 1] || ''
            
            cornerString += `${x}${y} `
        }

        return {
            edge: edgeString.trim(),
            corner: cornerString.trim()
        }
    }
}

/**
 * @link https://jperm.net/bld/
 */
export default class BlindSolver {
    rubiksCube: RubiksCube
    solution: Notation

    static EDGE_SWAP = new Notation(`R U R' U' R' F R2 U' R' U' R U R' F'`)
    static CORNER_SWAP = new Notation(`R U' R' U' R U R' F' R U R' U' R' F R`)
    static PARITY = new Notation(`R U' R' U' R U R D R' U' R D' R' U2 R' U'`)

    static EDGE_BUFFER = new Set(['B', 'M'])
    static EDGE_BUFFER_TARGET_SPACE: FaceLetters = "B"
    static EDGE_BUFFER_SWAP_SPACE: FaceLetters = "D"

    static CORNER_BUFFER = new Set(['A', 'E', 'R'])
    static CORNER_BUFFER_TARGET_SPACE: FaceLetters = "E"
    static CORNER_BUFFER_SWAP_SPACE: FaceLetters = "V"

    static EDGE_SETUP = new Map<FaceLetters, Notation>([
        ['A', new Notation(`Lw2 D' L2`)],
        ['C', new Notation(`Lw2 D L2`)],
        ['D', new Notation(``)],
        ['E', new Notation(`L Dw' L`)],
        ['F', new Notation(`Dw' L`)],
        ['G', new Notation(`L' Dw' L`)],
        ['H', new Notation(`Dw L'`)],
        ['I', new Notation(`Lw D' L2`)],
        ['J', new Notation(`Dw2 L`)],
        ['K', new Notation(`Lw D L2`)],
        ['L', new Notation(`L'`)],
        ['N', new Notation(`Dw L`)],
        ['O', new Notation(`D' Lw D L2`)],
        ['P', new Notation(`Dw' L'`)],
        ['Q', new Notation(`Lw' D L2`)],
        ['R', new Notation(`L`)],
        ['S', new Notation(`Lw' D' L2`)],
        ['T', new Notation(`Dw2 L'`)],
        ['U', new Notation(`D' L2`)],
        ['V', new Notation(`D2 L2`)],
        ['W', new Notation(`D L2`)],
        ['X', new Notation(`L2`)]
    ])

    static CORNER_SETUP = new Map<FaceLetters, Notation>([
        ['B', new Notation(`R2`)],
        ['C', new Notation(`F2 D`)],
        ['D', new Notation(`F2`)],
        ['F', new Notation(`F' D`)],
        ['G', new Notation(`F'`)],
        ['H', new Notation(`D' R`)],
        ['I', new Notation(`F R'`)],
        ['J', new Notation(`R'`)],
        ['K', new Notation(`F' R'`)],
        ['L', new Notation(`F2 R'`)],
        ['M', new Notation(`F`)],
        ['N', new Notation(`R' F`)],
        ['O', new Notation(`R2 F`)],
        ['P', new Notation(`R F`)],
        ['Q', new Notation(`R D'`)],
        ['S', new Notation(`D F'`)],
        ['T', new Notation(`R`)],
        ['U', new Notation(`D`)],
        ['V', new Notation(``)],
        ['W', new Notation(`D'`)],
        ['X', new Notation(`D2`)]
    ])

    constructor(rubiksCube: RubiksCube) {
        this.rubiksCube = rubiksCube
        this.solution = new Notation()
    }

    lettersToNotation(type: 'edge' | 'corner', letters: FaceLetters[]) {
        const moves = new Notation()
        
        for(let i = 0; i < letters.length; i++) {
            const letter = letters[i]
            const setup = type === 'edge' ? BlindSolver.EDGE_SETUP.get(letter) : BlindSolver.CORNER_SETUP.get(letter)

            if(!setup) {
                continue
            }

            const swap = type === 'edge' ? BlindSolver.EDGE_SWAP : BlindSolver.CORNER_SWAP

            // if(i === 3 && type === 'edge') {
            //     break
            // }

            // setup
            moves.addNotation(setup)

            // swap moves
            moves.addNotation(swap)

            // reverse setup
            const inverseSetup = setup.clone()

            inverseSetup.inverseMoves()
            moves.addNotation(inverseSetup)        
        }

        return moves
    }

    isCubeBuffer(cube: Cube) {
        if(cube.placement === 'edge') {
            return !cube.solvedLetters.isDisjointFrom(BlindSolver.EDGE_BUFFER)
        }

        return !cube.solvedLetters.isDisjointFrom(BlindSolver.CORNER_BUFFER)
    }

    getEdgeBuffer() {
        return this.rubiksCube.getCubeByLetters(BlindSolver.EDGE_BUFFER) as Cube
    }

    getCornerBuffer() {
        return this.rubiksCube.getCubeByLetters(BlindSolver.CORNER_BUFFER) as Cube
    }

    getUnsolvedEdges() {
        const unsolvedEdges = []

        for(let i = 0; i < this.rubiksCube.edges.length; i++) {
            const edge = this.rubiksCube.edges[i]

            if(edge.isSolved()) {
                continue
            }

            unsolvedEdges.push(edge)
        }

        return unsolvedEdges
    }

    getUnsolvedCorners() {
        const unsolvedCorners = []

        for(let i = 0; i < this.rubiksCube.corners.length; i++) {
            const corner = this.rubiksCube.corners[i]

            if(corner.isSolved()) {
                continue
            }

            unsolvedCorners.push(corner)
        }

        return unsolvedCorners
    }

    isEdgeBufferSolved() {
        for(let i = 0; i < this.rubiksCube.edges.length; i++) {
            const edge = this.rubiksCube.edges[i]

            if(BlindSolver.EDGE_BUFFER.isDisjointFrom(edge.solvedLetters)) {
                continue
            }

            // includes flipped buffer
            if(edge.isSolved() || !edge.solvedLetters.isDisjointFrom(edge.currentLetters)) {
                return true
            }
        }
        
        return false
    }

    isCornerBufferSolved() {
        for(let i = 0; i < this.rubiksCube.corners.length; i++) {
            const corner = this.rubiksCube.corners[i]

            if(BlindSolver.CORNER_BUFFER.isDisjointFrom(corner.solvedLetters)) {
                continue
            }

            // includes flipped buffer
            if(corner.isSolved() || !corner.solvedLetters.isDisjointFrom(corner.currentLetters)) {
                return true
            }
        }

        return false
    }

    isEdgesSolved() {
        for(let i = 0; i < this.rubiksCube.edges.length; i++) {
            const edge = this.rubiksCube.edges[i]
            
            if(!edge.isSolved()) {
                console.log(edge)

                return false
            }
        }

        return true
    }

    isCornersSolved() {
        for(let i = 0; i < this.rubiksCube.corners.length; i++) {
            const corner = this.rubiksCube.corners[i]
            
            if(!corner.isSolved()) {
                return false
            }
        }

        return true
    }

    /**
     * @description
     *  1. Unsolved buffer => Start at the BUFFER SPOT and end with the BUFFER PIECE
     */
    solveBuffer(type: 'edge' | 'corner', buffer: Cube, cubes: Cube[]) {
        const solvedCubes: Cube[] = []
        const solvedMoves: FaceLetters[] = []

        let targetCube: Cube = buffer
        // let targetLetter: FaceLetters = BlindSolver.EDGE_BUFFER_TARGET_SPACE
        let targetLetter: FaceLetters = type === 'edge' ? BlindSolver.EDGE_BUFFER_TARGET_SPACE : BlindSolver.CORNER_BUFFER_TARGET_SPACE

        // console.log(targetCube)

        const cubesLength = cubes.length
        for(let i = 0; i < cubesLength; i++) {
            const { swap, swapFace, unsolved } = this.findSwap(targetCube, targetLetter, cubes)

            // console.log(cubes.length, i)

            if(!swap) {
                break
            }
            
            if(i !== 0) {
                // console.log(targetLetter)

                solvedCubes.push(swap)
                solvedMoves.push(targetLetter)
            }


            targetCube = swap
            targetLetter = swapFace.currentLetter
            cubes = unsolved
        }

        // console.log(solvedMoves)

        return {
            solvedCubes, solvedMoves,
            unsolvedCubes: cubes
        }

        
        // console.log(this.findSwap(buffer, targetColor, cubes))
    }

    /**
     * @description
     * Unsolved Cases:
     * 2. Solved buffer => Start a new cycle and return to the original starting piece
     *      - Flipped pieces => Pick one side of a piece then find its corresponding solution
     */
    solveNonBuffer(cubes: Cube[]) {
        const solvedCubes: Cube[] = []
        const solvedMoves: FaceLetters[] = []
        
        cubes = cubes.filter(cube => !this.isCubeBuffer(cube))

        let targetCube: Cube = cubes[0]
        let targetLetter: FaceLetters = Array.from(targetCube.currentLetters)[0]
        let initialMove: FaceLetters = targetLetter
        let initialCube: Cube = targetCube

        let i = 0
        let LOOP_CHECK = 0
        while(cubes.length !== 0) {
            if(LOOP_CHECK++ >= 100) {
                console.error('Infinite Loop!')

                break
            }

            const { swap, swapFace, unsolved } = this.findSwap(targetCube, targetLetter, cubes)

            if(!swap) {
                const last = this.findSwap(targetCube, targetLetter, [initialCube])

                // console.log(last.swapFace!.currentLetter)
                // console.warn('LOOP')

                solvedMoves.push(last.swapFace!.currentLetter)
                solvedCubes.push(last.swap!)

                targetCube = cubes[0]
                targetLetter = Array.from(targetCube.currentLetters)[0]

                i = 0

                // break
                continue
            }

            if(i === 0) {
                initialMove = swapFace.currentLetter
                initialCube = swap
            }

            // console.log(swapFace.currentLetter)
            
            solvedMoves.push(swapFace.currentLetter)
            solvedCubes.push(swap)

            cubes = unsolved

            if(cubes.length === 0) {
                const last = this.findSwap(swap, swapFace.currentLetter, [initialCube])

                // console.log(last.swapFace!.currentLetter)

                solvedMoves.push(last.swapFace!.currentLetter)
                solvedCubes.push(last.swap!)

                break
            }

            targetCube = swap
            targetLetter = swapFace.currentLetter


            
            i++
        }

        return {
            solvedCubes, solvedMoves,
            unsolvedCubes: cubes
        }
    }

    findSwap(targetCube: Cube, targetLetter: FaceLetters, cubes: Cube[]) {
        // const targetDirection = Face.getDirectionByLetter(targetLetter)

        const swapIndex = cubes.findIndex(cube => !targetCube.solvedLetters.isDisjointFrom(cube.currentLetters))

        if(swapIndex === -1) {
            return {
                swap: null,
                swapFace: null,
                unsolved: [] as Cube[]
            }
        }

        const targetFace = targetCube.getFaceByLetter(targetLetter)!
        const swap = cubes[swapIndex]
        const swapFace = swap.getFaceByDirection(targetFace.solvedDirection) as Face

        const unsolved: Cube[] = []

        for(let i = 0; i < cubes.length; i++) {
            if(i === swapIndex) {
                continue
            }

            unsolved.push(cubes[i])
        }

        return {
            swap, swapFace, unsolved
        }
    }

    /**
     * @description
     * Unsolved Cases:
     *  1. Unsolved buffer => Start at the BUFFER SPOT and end with the BUFFER PIECE
     * 2. Solved buffer => Start a new cycle and return to the original starting piece
     *      - Flipped pieces => Pick one side of a piece then find its corresponding solution
     * 
     * 1. Solve edge buffer (if not solved)
     * 2. Find any unsolved edge and solve (including flipped pieces)
     * 3. Repeat step 2 for any unsolved edges
     * 4. Solve for parity if BOTH edges and corners are BOTH ODD number of solves
     * 5. Repeat for corner solve
     */
    solve() {
        const edgeMoves: FaceLetters[] = []
        const cornerMoves: FaceLetters[] = []
        let unsolvedEdges: Cube[] = this.getUnsolvedEdges()
        let unsolvedCorners: Cube[] = this.getUnsolvedCorners()

        if(unsolvedEdges.length !== 0) {
            const edgeBufferSolve = this.solveBuffer(
                'edge',
                this.getEdgeBuffer(),
                unsolvedEdges
            )

            edgeMoves.push(...edgeBufferSolve!.solvedMoves)
            unsolvedEdges = edgeBufferSolve!.unsolvedCubes
        }

        if(unsolvedEdges.length !== 0) {
            const edgeNonBufferSolve = this.solveNonBuffer(unsolvedEdges)
            
            edgeMoves.push(...edgeNonBufferSolve!.solvedMoves)
        }

        if(unsolvedCorners.length !== 0) {
            const cornerBufferSolve = this.solveBuffer(
                'corner',
                this.getCornerBuffer(),
                unsolvedCorners
            )

            cornerMoves.push(...cornerBufferSolve!.solvedMoves)
            unsolvedCorners = cornerBufferSolve!.unsolvedCubes
        }

        if(unsolvedCorners.length !== 0) {
            const cornerNonBufferSolve = this.solveNonBuffer(unsolvedCorners)

            cornerMoves.push(...cornerNonBufferSolve!.solvedMoves)
        }
        
        const edgeSolution = this.lettersToNotation('edge', edgeMoves)
        const cornerSolution = this.lettersToNotation('corner', cornerMoves)

        return new BlindSolution(edgeMoves, edgeSolution, cornerMoves, cornerSolution)
    }
}
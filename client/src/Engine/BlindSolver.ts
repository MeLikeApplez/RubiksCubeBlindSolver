import * as THREE from 'three'
import type Cube from './Cube'
import type { FaceLetters } from './Face'
import Face from './Face'
import Notation from './Notation'
import type RubiksCube from './RubiksCube'

// https://jperm.net/bld
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

    static EDGE_SETUP = new Map<string, Notation>([
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
        ['O', new Notation(`D2 L' Dw' L`)],
        ['P', new Notation(`Dw' L`)],
        ['Q', new Notation(`Lw' D L2`)],
        ['R', new Notation(`L`)],
        ['S', new Notation(`Lw' D' L2`)],
        ['T', new Notation(`Dw2 L'`)],
        ['U', new Notation(`D' L2`)],
        ['V', new Notation(`D2 L2`)],
        ['W', new Notation(`D L2`)],
        ['X', new Notation(`L2`)]
    ])

    static CORNER_SETUP = new Map<string, Notation>([
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
    solveBuffer(buffer: Cube, cubes: Cube[]) {
        
    }

    /**
     * @description
     * Unsolved Cases:
     * 2. Solved buffer => Start a new cycle and return to the original starting piece
     *      - Flipped pieces => Pick one side of a piece then find its corresponding solution
     */
    solveNonBuffer(cubes: Cube[]) {
       
    }

    findSwap(targetCube: Cube, targetColor: FaceLetters, cubes: Cube[]) {
        const targetDirection = Face.getDirectionByLetter(targetColor)
        
        const swapIndex = cubes.findIndex(cube => !targetCube.solvedLetters.isDisjointFrom(cube.currentLetters))

        if(swapIndex === -1) {
            return {
                swap: null,
                swapFace: null,
                unsolved: [] as Cube[]
            }
        }

        const swap = cubes[swapIndex]
        const swapFace = swap.getFaceByDirection(targetDirection) as Face

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
        let unsolvedEdges: Cube[] = this.getUnsolvedEdges()

        if(!this.isEdgeBufferSolved()) {
            // const edgeBufferSolve = this.solveBuffer(
                // this.getEdgeBuffer(),
                // unsolvedEdges
            // )

            // edgeMoves.push(...edgeBufferSolve.moves)
            // unsolvedEdges = edgeBufferSolve.unsolvedCubes

        }
        
        // if(!this.isEdgesSolved()) {
        //     const edgeNonBufferSolve = this.solveNonBuffer(unsolvedEdges)
            
        //     edgeMoves.push(...edgeNonBufferSolve.moves)
        // }
        
        console.log(edgeMoves)
    }
}
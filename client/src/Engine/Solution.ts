import * as THREE from 'three'
import type Cube from './Cube'
import type { FaceColors, FaceLetters } from './Face'
import Face from './Face'
import Notation from './Notation'
import type RubiksCube from './RubiksCube'
import BlindSolver from './BlindSolver'

export interface CycleSolution {
    solvedCubes: Cube[]
    solvedMoves: FaceLetters[]
    unsolvedCubes: Cube[]
    parent: CycleSolution | null
    branches: CycleSolution[]
    level: number
}

export class TreeSolution extends Array<CycleSolution> {
    readonly depth: number
    readonly totalBranches: number

    constructor(cycleSolutions: CycleSolution[], depth: number, totalBranches: number) {
        super()

        this.depth = depth
        this.totalBranches = totalBranches

        this.push(...cycleSolutions)
    }
}

interface BlindSolutionOptions {
    edge: {
        letters: FaceLetters[],
        moves: Notation
    }
    corner: {
        letters: FaceLetters[],
        moves: Notation
    }
}

export class ParticularBlindSolution {
    edge: BlindSolutionOptions['edge']
    corner: BlindSolutionOptions['corner']

    letters: FaceLetters[]
    moves: Notation
    parity: Notation

    constructor(options: BlindSolutionOptions) {
        this.edge = options.edge
        this.corner = options.corner

        this.parity = (this.edge.letters.length % 2 === 1 && this.corner.letters.length % 2 === 1) ? BlindSolver.PARITY : new Notation('')

        if(this.parity) {
            this.moves = Notation.combine(this.edge.moves, BlindSolver.PARITY, this.corner.moves)
        } else {
            this.moves = Notation.combine(this.edge.moves, this.corner.moves)
        }
        
        this.letters = [...this.edge.letters, ...this.corner.letters]
    }

    toString() {
        let edgeString = ''
        let cornerString = ''
        
        for(let i = 0; i < this.edge.letters.length; i+=2) {
            const x = this.edge.letters[i]
            const y = this.edge.letters[i + 1] || ''
            
            edgeString += `${x}${y} `
        }

        for(let i = 0; i < this.corner.letters.length; i+=2) {
            const x = this.corner.letters[i]
            const y = this.corner.letters[i + 1] || ''
            
            cornerString += `${x}${y} `
        }

        return {
            edge: edgeString.trim(),
            corner: cornerString.trim()
        }
    }
}

interface GeneralBlindSolutionOptions {
    edge: {
        buffer: {
            letters: FaceLetters[],
            moves: Notation
        }
        tree: TreeSolution
    }
    corner: {
        buffer: {
            letters: FaceLetters[],
            moves: Notation
        }
        tree: TreeSolution
    }
}

export class GeneralBlindSolution {
    edge: GeneralBlindSolutionOptions['edge']
    corner: GeneralBlindSolutionOptions['corner']

    constructor(options: GeneralBlindSolutionOptions) {
        this.edge = options.edge
        this.corner = options.corner
    
        console.log(
            this.getRandomSolution()
        )

    }

    pathSearch(type: 'edge' | 'corner', path: number[]) {
        const tree = type === 'edge' ? this.edge.tree : this.corner.tree

        if(path.length > tree.depth) {
            throw new Error('Path depth is greater than the depth of the tree!')
        }

        const cycles: CycleSolution[] = []
        let cycle: CycleSolution = this.edge.tree[path[0]]

        for(let i = 0; i < path.length; i++) {
            cycles.push(cycle)

            cycle = cycle.branches[i]
        }

        return cycles
    }

    getRandomSolution() {
        let randomIndex = Math.floor(Math.random() * this.edge.tree.length)
        let cycle: CycleSolution = this.edge.tree[randomIndex]

        const edgeLetters: FaceLetters[] = [...this.edge.buffer.letters]
        const cornerLetters: FaceLetters[] = [...this.corner.buffer.letters]

        const edgePath: number[] = []
        const cornerPath: number[] = []

        //  Edge solution
        while(cycle) {
            edgePath.push(randomIndex)
            edgeLetters.push(...cycle.solvedMoves)

            randomIndex = Math.floor(Math.random() * cycle.branches.length)
            cycle = cycle.branches[randomIndex]
        }

        //  Corner solution
        randomIndex = Math.floor(Math.random() * this.corner.tree.length)
        cycle = this.corner.tree[randomIndex]

        while(cycle) {
            cornerPath.push(randomIndex)
            cornerLetters.push(...cycle.solvedMoves)

            randomIndex = Math.floor(Math.random() * cycle.branches.length)
            cycle = cycle.branches[randomIndex]
        }

        const edgeMoves = BlindSolver.lettersToNotation('edge', edgeLetters)
        const cornerMoves = BlindSolver.lettersToNotation('corner', cornerLetters)
        
        return {
            path: {
                edge: edgePath,
                corner: cornerPath
            },
            solution: new ParticularBlindSolution({
             edge: {
                letters: edgeLetters,
                moves: edgeMoves
            },
            corner: {
                letters: cornerLetters,
                moves: cornerMoves
            }
        })
        }
    }
}
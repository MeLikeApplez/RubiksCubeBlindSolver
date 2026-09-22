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

interface ValidatedParticularSolutionOutput {
    type: 'edge' | 'corner'
    letters: FaceLetters[],
    pathTaken: number[],
    failPath: number,
    failReason: string,
    success: boolean
} 

type ValidatedGeneralSolutionOutput = {
    success: true
    solution: ParticularBlindSolution
    check: null
} | {
    success: false
    solution: null
    check: ValidatedParticularSolutionOutput
}

export class GeneralBlindSolution {
    edge: GeneralBlindSolutionOptions['edge']
    corner: GeneralBlindSolutionOptions['corner']

    constructor(options: GeneralBlindSolutionOptions) {
        this.edge = options.edge
        this.corner = options.corner
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

    /**
     * @description
     * Checks buffer solution first then cycle solution in this order ONLY. There are 
     * more ways to solve by mixing the order of which solution goes first but this is the 
     * simplest way.
     */
    validateParticularSolution(type: 'edge' | 'corner', letters: string | FaceLetters[], debug=false):ValidatedParticularSolutionOutput {
        let currentLetters: FaceLetters[]
        
        if(typeof letters === 'string') {
            currentLetters = Face.stringToArray(letters)
            letters = Array.from(currentLetters)
        } else {
            currentLetters = Array.from(letters)
        }

        let tree: TreeSolution | CycleSolution[] = type === 'edge' ? this.edge.tree : this.corner.tree
        const buffer = type === 'edge' ? this.edge.buffer.letters : this.corner.buffer.letters
        const pathTaken: number[] = []
        const result = {
            type: type,
            letters: letters,
            pathTaken: pathTaken,
            failPath: -1,
            failReason: '',
            success: true
        }

        if(letters.length < buffer.length) {
            result.success = false
            result.failPath = letters.length - 1
            result.failReason = '[Buffer] Input solution is too small'
            
            if(debug) console.error(result.failReason)

            return result
        }

        const lettersSolution: FaceLetters[] = []

        // Buffer check
        for(let i = 0; i < buffer.length; i++) {
            if(buffer[i] !== letters[i]) {
                result.failReason = `[Cycle] Fails at index "${i}"`

                if(debug) console.error(result.failReason, letters[i])

                result.failPath = i
                result.success = false
                
                return result
            }

            currentLetters.shift()
            lettersSolution.push(buffer[i])
        }

        // Tree check
        let spliceCount = buffer.length

        while(true) {
            if(tree.length === 0) {
                if(currentLetters.length !== 0) {
                    result.failReason = `[Cycle] Input solution is too big`

                    if(debug) console.error(result.failReason)
                
                    result.failPath = letters.length -  currentLetters.length
                    result.success = false

                    return result
                }
                
                break
            }

            for(let i = 0; i < tree.length; i++) {
                const branch = tree[i]
                let match = false
                let spliceLength = 0

                for(let j = 0; j < branch.solvedMoves.length; j++) {
                    const move = branch.solvedMoves[j]

                    if(move !== currentLetters[j]) {
                        break
                    }

                    if(j === branch.solvedMoves.length - 1) {
                        spliceLength = branch.solvedMoves.length
                        match = true
                    }
                }

                if(match) {
                    pathTaken.push(i)

                    currentLetters.splice(0, spliceLength)
                    spliceCount += spliceLength

                    break
                }

                if(!match && i === tree.length - 1) {
                    result.failReason = `[Cycle] Input is incomplete or wrong, fails at index ${spliceCount}`

                    if(debug) console.error(result.failReason)

                    result.failPath = spliceCount
                    result.success = false

                    return result
                }
            }

            const lastPath = pathTaken[pathTaken.length - 1]
            tree = tree[lastPath].branches
        }
    
        return result
    }

    /**
     * @description
     * Validates both edge and corner moves. Checks buffer solution first then cycle solution in this order ONLY.
     */
    validate(edgeLetters: string | FaceLetters[], cornerLetters: string | FaceLetters[], debug=false): ValidatedGeneralSolutionOutput {
        const edgeValidation = this.validateParticularSolution('edge', edgeLetters, debug)
        const cornerValidation = this.validateParticularSolution('corner', cornerLetters, debug)
    
        if(!edgeValidation.success) {
            // console.error('Edge validation fail', edgeValidation)
        
            return {
                success: false,
                solution: null,
                check: edgeValidation
            }
        }

        if(!cornerValidation.success) {
            // console.error('Corner validation fail', cornerValidation)
        
            return {
                success: false,
                solution: null,
                check: cornerValidation
            }
        }

        const edgeMoves = BlindSolver.lettersToNotation('edge', edgeValidation.letters)
        const cornerMoves = BlindSolver.lettersToNotation('corner', cornerValidation.letters)
        
        return {
            success: true,
            solution: new ParticularBlindSolution({
                edge: {
                    letters: edgeValidation.letters,
                    moves: edgeMoves
                },
                corner: {
                    letters: cornerValidation.letters,
                    moves: cornerMoves
                }
            }),
            check: null
        }
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
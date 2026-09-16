import * as THREE from 'three'
import Cube from './Cube'
import Face, { type FaceColors, type FaceLetters } from './Face'
import Notation, { MoveInfo } from './Notation'

export type Axis3D = 'x' | 'y' | 'z'
interface AnimationOptions {
    delay?: number
}

interface AnimationDetails {
    axis: Axis3D
    layers: number[]
    rotations: number
    rotation: THREE.Matrix4
    cubes: Cube[]
}
export default class RubiksCube {
    corners: Cube[]
    edges: Cube[]
    centers: Cube[]
    cubes: Cube[]
    animationQueue: AnimationDetails[]
    animating: boolean
    steps: number
    stepsCounted: number

    constructor() {
        this.corners = []
        this.edges = []
        this.centers = []
        this.cubes = []

        this.animationQueue = []
        this.animating = false
        this.steps = 30
        this.stepsCounted = 0

        this.create()
    }

    create() {
        this.corners = [
            new Cube({ placement: 'corner', white: 'A', orange: 'E', blue: 'R' }),
            new Cube({ placement: 'corner', white: 'B', red: 'N', blue: 'Q' }),
            new Cube({ placement: 'corner', white: 'C', green: 'J', red: 'M' }),
            new Cube({ placement: 'corner', white: 'D', orange: 'F', green: 'I' }),
            
            new Cube({ placement: 'corner', orange: 'G', green: 'L', yellow: 'U' }),
            new Cube({ placement: 'corner', orange: 'H', yellow: 'X', blue: 'S' }),
            new Cube({ placement: 'corner', red: 'O', yellow: 'W', blue: 'T' }),
            new Cube({ placement: 'corner', red: 'P', green: 'K', yellow: 'V' }),
        ]
        this.edges = [
            new Cube({ placement: 'edge', white: 'D', orange: 'E' }),
            new Cube({ placement: 'edge', white: 'A', blue: 'Q' }),
            new Cube({ placement: 'edge', white: 'C', green: 'I' }),
            new Cube({ placement: 'edge', white: 'B', red: 'M' }),

            new Cube({ placement: 'edge', yellow: 'U', green: 'K' }),
            new Cube({ placement: 'edge', yellow: 'V', red: 'O' }),
            new Cube({ placement: 'edge', yellow: 'W', blue: 'S' }),
            new Cube({ placement: 'edge', yellow: 'X', orange: 'G' }),
            
            new Cube({ placement: 'edge', green: 'J', red: 'P' }),
            new Cube({ placement: 'edge', green: 'L', orange: 'F' }),
            new Cube({ placement: 'edge', blue: 'R', orange: 'H' }),
            new Cube({ placement: 'edge', blue: 'T', red: 'N' }),
        ]
        this.centers = [
            new Cube({ placement: 'center', white: '*' }),
            new Cube({ placement: 'center', orange: '*' }),
            new Cube({ placement: 'center', green: '*' }),
            new Cube({ placement: 'center', red: '*' }),
            new Cube({ placement: 'center', blue: '*' }),
            new Cube({ placement: 'center', yellow: '*' }),
        ]

        this.cubes = [
            ...this.corners,
            ...this.edges,
            ...this.centers
        ]
    }

    getCubeByLetters(letters: Set<Omit<FaceLetters, '*'>>) {
        for(let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i]
            
            if(cube.currentLetters.isDisjointFrom(letters) || cube.currentLetters.size !== letters.size) {
                continue
            }

            return cube
        }

        return null
    }

    getCubesByColor(color: FaceColors) {
        const cubesFound: Cube[] = []

        for(let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i]

            if(!cube.colors.has(color)) {
                continue
            }

            cubesFound.push(cube)
        }

        return cubesFound
    }

    getCubesByFace(face: FaceColors) {
        const cubesFound: Cube[] = []
        const direction = Face.getDirectionByColor(face)

        for(let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i]
            const cubeDirection = cube.position.clone().multiply(direction)

            if(!cubeDirection.equals(direction)) {
                continue
            }
            
            cubesFound.push(cube)
        }

        return cubesFound
    }

    getCubesByAxis(axis: Axis3D, layer: number) {
        const cubesFound: Cube[] = []

        for(let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i]

            if(cube.position[axis] === layer) {
                cubesFound.push(cube)
            }
        }

        return cubesFound
    }

    addToScene(scene: THREE.Scene) {
        for(let i = 0; i < this.cubes.length; i++) {
            scene.add(this.cubes[i].mesh)
        }
    }

    isSolved() {
        for(let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i]

            if(!cube.isSolved()) {
                return false
            }
        }

        return true
    }

    turn(axis: Axis3D, layers: number[], rotations=1, animation?: AnimationOptions) {
        let angle = 0
        
        if(animation) {
            angle = (Math.PI / 2)  * (rotations / this.steps)
        } else {
            angle = (Math.PI / 2)  * rotations
        }
        
        const rotationMatrix = new THREE.Matrix4()

        switch(axis) {
            case 'x':
                rotationMatrix.makeRotationX(angle)
                break
                case 'y':
                rotationMatrix.makeRotationY(angle)
                break
            case 'z':
                rotationMatrix.makeRotationZ(angle)
                break
        }

        if(animation) {
            this.animationQueue.push({
                axis, layers, rotations,
                rotation: rotationMatrix,
                cubes: []
            })
            
            return
        }

        const cubes: Cube[] = []

        for(let i = 0; i < layers.length; i++) {
            const layer = layers[i]

            cubes.push(
                ...this.getCubesByAxis(axis, layer)
            )
        }

        if(cubes.length === 0) {
            return
        }

        for(let i = 0; i < cubes.length; i++) {
            const cube = cubes[i]

            cube.mesh.applyMatrix4(rotationMatrix)
            cube.mesh.position.round()
            cube.updateLetters(rotationMatrix)
        }
    }

    turnWithNotation(notation: Notation, animation?: AnimationOptions) {
        for(let i = 0; i < notation.moves.length; i++) {
            const move = notation.moves[i]
            const instruction = Notation.MOVE_MAP.get(move) as MoveInfo

            if(instruction) {
                    this.turn(
                        instruction.axis,
                        instruction.layer,
                        instruction.rotations,
                        animation
                    )
            } else {
                throw new Error(`Invalid move! "${move}"`)
            }
        }

        this.animating = true
    }

    clearAnimation() {

    }

    playAnimation() {

    }

    render(deltaTime: number) {
        if(!this.animating || this.animationQueue.length === 0) return

        const { axis, layers, rotation, cubes } = this.animationQueue[0]

        if(cubes.length === 0) {
            for(let i = 0; i < layers.length; i++) {
                const layer = layers[i]

                cubes.push(
                    ...this.getCubesByAxis(axis, layer)
                )
            }
        }

        for(let i = 0; i < cubes.length; i++) {
            const cube = cubes[i]
            
            cube.mesh.applyMatrix4(rotation)
            cube.updateLetters(rotation)
        
            if(this.stepsCounted >= this.steps - 1) {
                cube.mesh.position.round()
            }
        }

        if(this.stepsCounted >= this.steps - 1) {
            this.animationQueue.shift()

            this.stepsCounted = 0
        } else {
            this.stepsCounted++
        }

    }
}
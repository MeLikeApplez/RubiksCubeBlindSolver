import * as THREE from 'three'
import Cube from './Cube'
import Face, { type FaceColors, type FaceLetters } from './Face'
import Notation, { MoveInfo } from './Notation'
import { deinterleaveAttribute } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type Axis3D = 'x' | 'y' | 'z'

const Axis3DVectors = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
}

interface AnimationDetails {
    axis: Axis3D
    layers: number[]
    rotations: number
    rotationMatrix: THREE.Matrix4
    angle: number
    cubes: Cube[]
    steps: number
}
export default class RubiksCube {
    corners: Cube[]
    edges: Cube[]
    centers: Cube[]
    cubes: Cube[]
    animationQueue: AnimationDetails[]
    animating: boolean
    stepsCounted: number

    constructor() {
        this.corners = []
        this.edges = []
        this.centers = []
        this.cubes = []

        this.animationQueue = []
        this.animating = false
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

    getCubesByLayers(axis: Axis3D, layers: number[]) {
        const cubes: Cube[] = []

        for(let i = 0; i < layers.length; i++) {
            const layer = layers[i]

            cubes.push(
                ...this.getCubesByAxis(axis, layer)
            )
        }

        return cubes
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

    calculateFrameTurn(animation: AnimationDetails, steps: number) {
        const angle = (Math.PI / 2)  * (animation.rotations / steps)

        switch(animation.axis) {
            case 'x':
                animation.rotationMatrix.makeRotationX(angle)
                break
            case 'y':
                animation.rotationMatrix.makeRotationY(angle)
                break
            case 'z':
                animation.rotationMatrix.makeRotationZ(angle)
                break
        }
    }

    turn(axis: Axis3D, layers: number[], rotations=1, animate=false) {
        const angle = (Math.PI / 2)  * rotations
        
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

        if(animate) {
            this.animationQueue.push({
                axis, layers, rotations, angle,
                rotationMatrix: rotationMatrix,
                cubes: [],
                steps: 0
            })
            
            return
        }

        const cubes = this.getCubesByLayers(axis, layers)

        for(let i = 0; i < cubes.length; i++) {
            const cube = cubes[i]
            
            cube.mesh.applyMatrix4(rotationMatrix)
            cube.mesh.position.round()
            cube.updateLetters(rotationMatrix)
        }
    }

    turnWithNotation(notation: Notation, animate=false) {
        for(let i = 0; i < notation.moves.length; i++) {
            const move = notation.moves[i]
            const instruction = Notation.MOVE_MAP.get(move) as MoveInfo

            if(instruction) {
                this.turn(
                    instruction.axis,
                    instruction.layer,
                    instruction.rotations,
                    animate
                )
            } else {
                throw new Error(`Invalid move! "${move}"`)
            }
        }

        this.animating = true
    }

    render(deltaTime: number) {
        if(!this.animating || this.animationQueue.length === 0) return

        const animation = this.animationQueue[0]

        if(animation.cubes.length === 0) {
            animation.cubes = this.getCubesByLayers(animation.axis, animation.layers)
        }

        for(let i = 0; i < animation.cubes.length; i++) {
            const cube = animation.cubes[i]
            
            cube.mesh.applyMatrix4(animation.rotationMatrix)
            
            if(this.stepsCounted >= animation.steps - 1) {
                // cube.mesh.position.round()
                cube.updateLetters(animation.rotationMatrix)
            }
        }

        if(this.stepsCounted >= animation.steps - 1) {
            this.animationQueue.shift()

            this.stepsCounted = 0
        } else {
            this.stepsCounted++
        }
    }
}
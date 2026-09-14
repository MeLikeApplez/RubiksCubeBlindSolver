import * as THREE from 'three'
import Face from './Face'
import type { FaceColors, FaceLetters } from './Face'

interface CubeOptions {
    red?: FaceLetters
    orange?: FaceLetters
    white?: FaceLetters
    yellow?: FaceLetters
    green?: FaceLetters
    blue?: FaceLetters
    placement: CubePlacement
}

export type CubePlacement = 'corner' | 'edge' | 'center'

export default class Cube {
    mesh: THREE.Mesh
    faces: Face[]
    currentLetters: Set<Omit<FaceLetters, "*">>
    solvedLetters: Set<Omit<FaceLetters, "*">>
    colors: Set<FaceColors>
    position: THREE.Vector3
    placement: CubePlacement

    constructor(options: CubeOptions) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            Face.getMeshColor('black')
        )

        this.mesh.scale.multiplyScalar(0.9)

        this.faces = []
        
        this.currentLetters = new Set()
        this.solvedLetters = new Set()
        
        this.colors = new Set()
        
        this.position = this.mesh.position

        this.placement = options.placement

        this.create(options)
    }

    create(options: CubeOptions) {
        const faces = {
            red: options?.red ?? null,
            orange: options?.orange ?? null,
            white: options?.white ?? null,
            yellow: options?.yellow ?? null,
            green: options?.green ?? null,
            blue: options?.blue ?? null,
        }

        this.faces = []

        if(faces.red !== null) this.faces.push(new Face('red', faces.red))
        if(faces.orange !== null) this.faces.push(new Face('orange', faces.orange))
        if(faces.white !== null) this.faces.push(new Face('white', faces.white))
        if(faces.yellow !== null) this.faces.push(new Face('yellow', faces.yellow))
        if(faces.green !== null) this.faces.push(new Face('green', faces.green))
        if(faces.blue !== null) this.faces.push(new Face('blue', faces.blue))

        this.mesh.material = [
            Face.getMeshColor(faces.red ? 'red' : null),
            Face.getMeshColor(faces.orange ? 'orange' : null),
            Face.getMeshColor(faces.white ? 'white' : null),
            Face.getMeshColor(faces.yellow ? 'yellow' : null),
            Face.getMeshColor(faces.green ? 'green' : null),
            Face.getMeshColor(faces.blue ? 'blue' : null),
        ]

        this.position.set(0, 0, 0)
        this.currentLetters.clear()
        this.solvedLetters.clear()
        this.colors.clear()

        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            this.position.add(face.direction)
            
            this.colors.add(face.color)

            if(face.currentLetter === '*') {
                continue
            }

            this.currentLetters.add(face.currentLetter)
            this.solvedLetters.add(face.currentLetter)
        }
    }

    equals(cube: Cube) {
        return this.currentLetters.size === cube.currentLetters.size && !this.currentLetters.isDisjointFrom(cube.currentLetters) 
    }

    getFaceByDirection(direction: THREE.Vector3) {
        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            if(face.direction.equals(direction)) {
                return face
            }
        }

        return null
    }

    getFaceByLetter(letter: FaceLetters) {
        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            if(face.currentLetter === letter) {

                return face
            }
        }

        return null
    }

    isFlipped() {
        const isLetterSolved = !this.currentLetters.isDisjointFrom(this.solvedLetters)

        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            if(face.direction.equals(face.solvedDirection)) {
                return false
            }
        }

        return isLetterSolved
    }

    isSolved() {
        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            if(face.direction.equals(face.solvedDirection) && face.currentLetter === face.solvedLetter) {
                continue
            }

            return false
        }

        return true
    }

    setColor(color: FaceColors) {
        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            // face.setColor(color)
        }
    }

    updateLetters(rotationMatrix: THREE.Matrix4) {
        this.currentLetters.clear()
        
        for(let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i]

            if(face.currentLetter === '*') {
                continue
            }

            face.direction.applyMatrix4(rotationMatrix)
            face.direction.round()

            face.updateLetter(this.position)

            this.currentLetters.add(face.currentLetter)
        }
    }
}
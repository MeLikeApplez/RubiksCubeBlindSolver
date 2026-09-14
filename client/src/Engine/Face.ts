import * as THREE from 'three'

// "*" => Center piece
export type FaceLetters = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | '*'
export type FaceColors = 'red' | 'orange' | 'white' | 'yellow' | 'green' | 'blue' | 'black'

export default class Face {
    color: FaceColors
    currentLetter: FaceLetters
    solvedLetter: FaceLetters
    direction: THREE.Vector3
    solvedDirection: THREE.Vector3

    static RIGHT = new THREE.Vector3(1, 0, 0)
    static LEFT = new THREE.Vector3(-1, 0, 0)
    static UP = new THREE.Vector3(0, 1, 0)
    static DOWN = new THREE.Vector3(0, -1, 0)
    static FRONT = new THREE.Vector3(0, 0, 1)
    static BACK = new THREE.Vector3(0, 0, -1)

    constructor(color: FaceColors, letter: FaceLetters) {
        this.color = color

        this.currentLetter = letter
        this.solvedLetter = letter
        
        this.direction = Face.getDirectionByColor(color)
        this.solvedDirection = this.direction.clone()
    }

    static getLetterByDirection(direction: THREE.Vector3, position: THREE.Vector3) {
        const { x, y, z } = position

        let letter: FaceLetters = '*'

        if(direction.equals(Face.UP)) {
            if(z === -1 && (x === -1 || x === 0)) {
                letter = 'A'
            } else if(x === 1 && (z === -1 || z === 0)) {
                letter = 'B'
            } else if(z === 1 && (x === 1 || x === 0)) {
                letter = 'C'                    
            } else if(x === -1 && (z === 1 || z === 0)) {
                letter = 'D'
            }
        } else if(direction.equals(Face.LEFT)) {
            if(y === 1 && (z === -1 || z === 0)) {
                letter = 'E'
            } else if(z === 1 && (y === 1 || y === 0)) {
                letter = 'F'
            } else if(y === -1 && (z === 1 || z === 0)) {
                letter = 'G'
            } else if(z === -1 && (y === -1 || y === 0)) {
                letter = 'H'
            }
        } else if(direction.equals(Face.FRONT)) {
            if(y === 1 && (x === -1 || x === 0)) {
                letter = 'I'
            } else if(x === 1 && (y === 1 || y === 0)) {
                letter = 'J'
            } else if(y === -1 && (x === 1 || x === 0)) {
                letter = 'K'
            } else if(x === -1 && (y === -1 || y === 0)) {
                letter = 'L'
            }
        } else if(direction.equals(Face.RIGHT)) {
            if(y === 1 && (z === 1 || z === 0)) {
                letter = 'M'
            } else if(z === -1 && (y === 1 || y === 0)) {
                letter = 'N'
            } else if(y === -1 && (z === -1 || z === 0)) {
                letter = 'O'
            } else if(z === 1 && (y === -1 || y === 0)) {
                letter = 'P'
            }
        } else if(direction.equals(Face.BACK)) {
            if(y === 1 && (x === 1 || x === 0)) {
                letter = 'Q'
            } else if(x === -1 && (y === 1 || y === 0)) {
                letter = 'R'
            } else if(y === -1 && (x === -1 || x === 0)) {
                letter = 'S'
            } else if(x === 1 && (y === -1 || y === 0)) {
                letter = 'T'
            }
        } else if(direction.equals(Face.DOWN)) {
            if(z === 1 && (x === -1 || x === 0)) {
                letter = 'U'
            } else if(x === 1 && (z === 1 || z === 0)) {
                letter = 'V'
            } else if(z === -1 && (x === 1 || x === 0)) {
                letter = 'W'                    
            } else if(x === -1 && (z === -1 || z === 0)) {
                letter = 'X'
            }
        }

        return letter
    }

    static getDirectionByLetter(letter: FaceLetters) {
        switch(letter) {
            case 'A':
            case 'B':
            case 'C':
            case 'D':
                return Face.UP
            case 'E':
            case 'F':
            case 'G':
            case 'H':
                return Face.LEFT
            case 'I':
            case 'J':
            case 'K':
            case 'L':
                return Face.FRONT
            case 'M':
            case 'N':
            case 'O':
            case 'P':
                return Face.RIGHT
            case 'Q':
            case 'R':
            case 'S':
            case 'T':
                return Face.BACK
            case 'U':
            case 'V':
            case 'W':
            case 'X':
                return Face.DOWN
            default: return new THREE.Vector3(0, 0, 0)
        }
    }

    static getDirectionByColor(color: FaceColors | null) {
        switch(color) {
            case 'red': return new THREE.Vector3(1, 0, 0)
            case 'orange': return new THREE.Vector3(-1, 0, 0)
            case 'white': return new THREE.Vector3(0, 1, 0)
            case 'yellow': return new THREE.Vector3(0, -1, 0)
            case 'green': return new THREE.Vector3(0, 0, 1)
            case 'blue': return new THREE.Vector3(0, 0, -1)
            case 'black':
            default: return new THREE.Vector3(0, 0, 0)
        }
    }

    static getMeshColor(color: FaceColors | null) {
        switch(color) {
            case 'red': return new THREE.MeshBasicMaterial({ color: 'rgb(250, 50, 50)' })
            case 'orange': return new THREE.MeshBasicMaterial({ color: 'rgb(250, 150, 50)' })
            case 'white': return new THREE.MeshBasicMaterial({ color: 'rgb(250, 250, 250)' })
            case 'yellow': return new THREE.MeshBasicMaterial({ color: 'rgb(250, 250, 50)' })
            case 'green': return new THREE.MeshBasicMaterial({ color: 'rgb(50, 250, 50)' })
            case 'blue': return new THREE.MeshBasicMaterial({ color: 'rgb(50, 50, 250)' })
            case 'black':
            default: return new THREE.MeshBasicMaterial({ color: 'rgb(0, 0, 0)' })
        }
    }

    setColor(color: FaceColors) {
        this.color = color
    }

    updateLetter(position: THREE.Vector3) {
        const newLetter = Face.getLetterByDirection(this.direction, position)

        this.currentLetter = newLetter
    }
}
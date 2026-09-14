import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import RubiksCube from './RubiksCube'
import Face from './Face'
import Notation from './Notation'
import BlindSolver from './BlindSolver'

export default function main(canvas: HTMLCanvasElement) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100)
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
    const scene = new THREE.Scene()
    const controls = new OrbitControls(camera, renderer.domElement)

    controls.enablePan = false

    window.onresize = resize
    renderer.setAnimationLoop(animate)
    renderer.setSize(window.innerWidth, window.innerHeight)

    camera.position.set(-6, 6, 6)
    
    const rubiksCube = new RubiksCube()
    const solver = new BlindSolver(rubiksCube)
    const test1 = new Notation(`U2 M2 U M2 U2 M2 U M2 U2`)
    const test2 = new Notation(`F2 B R2 U' L2 U2 B' L' F2 U' B2 U L2 U R2 F2 L2 U' L2 F`)
    const test3 = new Notation(`D' U2 R L' B' L2 R2 U L2 F' L' D2 R U2 D2 F2 R' F R' U`)
    const test4 = new Notation(`M2 U2 M2 U2`)
    const test5 = new Notation(`
        Lw D' L2
        R U R' U' R' F R2 U' R' U' R U R' F'
        L2 D Lw'

        Lw2 D L2
        R U R' U' R' F R2 U' R' U' R U R' F'
        L2 D' Lw2 
    `)

    rubiksCube.addToScene(scene)
    
    // rubiksCube.turnWithNotation(test1)
    // rubiksCube.turnWithNotation(test2)
    rubiksCube.turnWithNotation(test3)
    // rubiksCube.turnWithNotation(test4)
    // rubiksCube.turnWithNotation(test5)

    // console.log(rubiksCube)
    solver.solve()

    function animate() {
        controls.update()
        renderer.render(scene, camera)
    }

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight)

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    }
}
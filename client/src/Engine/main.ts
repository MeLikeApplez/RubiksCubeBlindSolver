import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import RubiksCube from './RubiksCube'
import Face from './Face'
import Notation from './Notation'
import BlindSolver from './BlindSolver'

export function test(canvas: HTMLCanvasElement) {
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

    camera.position.set(6, 6, 6)
    
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
    const test6 = new Notation(`B2 R2 B2 L U2 R' B2 R2 B2 R' U' B' F L' B D R B2 D B' D' U`)
    const test7 = new Notation(`U' L2 D' U R2 B' D' U' L2 B2 R' U' B' F' L U2 F R2 U'`)
    // Middle slicing fails during solve... Disable it
    const test8 = new Notation(`f2 u`)
    const test9 = new Notation(`M2 U2 M2 U2 E2 L2 E2 L2`)

    rubiksCube.addToScene(scene)
    
    // Edge Test
    // rubiksCube.turnWithNotation(test1)
    // rubiksCube.turnWithNotation(test4)
    // rubiksCube.turnWithNotation(test9)

    // Edge & Corner Test
    // rubiksCube.turnWithNotation(test2)
    // rubiksCube.turnWithNotation(test3)
    // rubiksCube.turnWithNotation(test5)
    rubiksCube.turnWithNotation(test6)
    // rubiksCube.turnWithNotation(test7)
    // rubiksCube.turnWithNotation(test8)

    // rubiksCube.scramble(10)

    const generalSolution = solver.findGeneralSolution()
    const particularSolution = solver.findParticularSolution()

    console.log(
        // particularSolution,
        generalSolution
    )

    // const validate = generalSolution.validate('CJ DX WE HF RA O KN Q', 'XC BM DO K')
    const validate = generalSolution.validate('QU SD EC OJ HT GC', 'BH CT BL DU KV')

    console.warn(
        // generalSolution.validate('', ''),
        validate
    )

    const randomSolution = generalSolution.getRandomSolution()

    console.log(
        randomSolution.solution.edge.letters,
        randomSolution.solution.corner.letters
    )

    // console.log(solver.findParticularSolution())

    // solver.solve()
    // console.log(solver.solutions[0].toString())

    // rubiksCube.animationSpeed = 10
    // rubiksCube.turnWithNotation(solver.solutions[0].moves, true)
    
    console.log(rubiksCube)
    console.log(solver)

    const timer = new THREE.Timer()

    function animate() {
        timer.update()

        rubiksCube.render(timer.getDelta())
        controls.update()
        renderer.render(scene, camera)     
    }

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight)

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    }
}
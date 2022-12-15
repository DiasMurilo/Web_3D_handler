import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GUI } from 'dat.gui'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
)

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild(renderer.domElement)


let currentUrl = window.location.href;
let file = currentUrl.split('/').pop()
let ext = file?.split('.').pop()
let url = 'models/'+ file
var boxSize: number[] = new Array()
const absMaterial = new THREE.MeshNormalMaterial
switch(ext){
    case 'fbx':

        const fbxLoader = new FBXLoader()
        fbxLoader.load(
            url,
            (object) => {
                object.traverse(function (child) {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).material = absMaterial
                        if ((child as THREE.Mesh).material) {
                            ((child as THREE.Mesh).material as THREE.MeshNormalMaterial).transparent = false
                        }
                    }
                })
                guiInitializer(absMaterial)
                scene.add(object)
                boxSize = getBoxSize(object)
                setCamera(boxSize)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
        break;
    
    case 'stl':
        const stlLoader = new STLLoader()
        stlLoader.load( url, function ( geometry ) {
            var mesh = new THREE.Mesh( geometry, absMaterial );
            mesh.position.set( 0, 0, 0 );
            mesh.rotation.set( - Math.PI / 2, 0, 0 );
            scene.add( mesh );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            boxSize = getBoxSize(mesh)
            setCamera(boxSize)
            guiInitializer(absMaterial)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        });
        break;

    case 'glb':
        //no break if glb so it will be handled as gltf
    case 'gltf':
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/js/libs/draco/')

        const loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)
        loader.load(
            url,
            function (gltf) {
                        gltf.scene.traverse(function (child) {
                            if ((child as THREE.Mesh).isMesh) {
                                (child as THREE.Mesh).material = absMaterial
                            }
                            boxSize = getBoxSize(child)
                            setCamera(boxSize)
                        })
                        guiInitializer(absMaterial)
                        scene.add(gltf.scene)
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log(error)
                    }
        )
        break;

    case 'obj':
        const objLoader = new OBJLoader()
        objLoader.load(
            url,
            (object) => {
                (object.children[0] as THREE.Mesh).material = absMaterial
                object.traverse(function (child) {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).material = absMaterial
                    }
                })
                scene.add(object)
                boxSize = getBoxSize(object)
                setCamera(boxSize)
                guiInitializer(absMaterial)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
        break;     
            
    default:
        alert('No file found or extension not supported')
}

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

function setCamera(objectSize: Array<number>){
    scene.background = new THREE.Color(0xfffff0)
    camera.lookAt(new THREE.Vector3(0,0,0))
    let x
    let y
    let z
    if(objectSize[0] != undefined && objectSize[1] != undefined && objectSize[1] != undefined){
        x = objectSize[0]
        y = objectSize[1]
        z = objectSize[2]
    } else {
        var degree = Math.PI/180;
        z = 120;
        y = 120;
        x = -45 * degree;
    }
    camera.position.set(y, x, z+x+y)

    const light = new THREE.PointLight()
    light.position.set(x, y, z+x+y)
    light.position.set(x, y, -(z+x+y))
    scene.add(light)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    scene.add(new THREE.AxesHelper(Math.max(x,y,z)))
}

function getBoxSize(object: THREE.Group | THREE.Object3D<THREE.Event> | THREE.Mesh<THREE.BufferGeometry, THREE.MeshNormalMaterial>){
    let boundingBox = new THREE.Box3().setFromObject( object );
    let boxSize = new THREE.Vector3();
    boundingBox.getSize(boxSize);
    return [Math.round(boxSize.x),Math.round(boxSize.y),Math.round(boxSize.z)]
}

//resize view as user change windows size
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

function guiInitializer(material: any){
    const gui = new GUI()
    const controlFolder = gui.addFolder('Controls')
    controlFolder.add(material, 'transparent').onChange(() => material.needsUpdate = true)
    controlFolder.add(material, 'opacity', 0, 1, 0.01)
    controlFolder.add(material, 'wireframe')
    controlFolder
        .add(material, 'flatShading')
        .onChange(() => updateMaterial(material))
        controlFolder.open()
}

function updateMaterial(material: any) {
    material.needsUpdate = true
}

animate()

//recursive function to update scene continuously
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}
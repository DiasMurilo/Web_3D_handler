import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    50000
)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.physicallyCorrectLights = true

//resize view as user change windows size
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)

let currentUrl = window.location.href;
let file = currentUrl.split('/').pop()
let ext = file?.split('.').pop()
let url = 'models/' + file
var boxSize: number[] = new Array()
// const absMaterial = new THREE.MeshNormalMaterial
const absMaterial = new THREE.MeshPhongMaterial({
    color: 0x1111111,
    wireframe: false,
    flatShading: false,
    transparent: true
})

var isCustomMaterial = false;

switch (ext) {
    case 'ply':
        isCustomMaterial = true;
        const plyLoader = new PLYLoader();
        plyLoader.load(
            url,
            (ply) => {
                ply.computeVertexNormals;
                const mesh = new THREE.Mesh(ply, absMaterial);
                renderObject(mesh);
                guiInitializer(absMaterial, mesh);
            });
        break;

    case 'dae':
        isCustomMaterial = true;
        const colladaLoad = new ColladaLoader();
        colladaLoad.load(
            url, 
           (dae) => {
            materialConfig(dae.scene);
            renderObject(dae.scene);
            guiInitializer(absMaterial, dae.scene);
           });
        break;

    case 'fbx':

        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            url,
            (fbx) => {
                materialConfig(fbx);
                renderObject(fbx);
                guiInitializer(absMaterial, fbx);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log(error);
            }
        )
        break;

    case 'stl':
        const stlLoader = new STLLoader()
        stlLoader.load(url, function (geometry) {
            var mesh = new THREE.Mesh(geometry, absMaterial);
            mesh.position.set(0, 0, 0);
            mesh.rotation.set(- Math.PI / 2, 0, 0);
            scene.add(mesh);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            boxSize = getBoxSize(mesh)
            setCamera(boxSize)
            guiInitializer(absMaterial, mesh)
        },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            });
        break;

    case 'glb':
    case 'gltf':
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/js/libs/draco/');

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load(
            url,
            function (gltf) {
                materialConfig(gltf.scene);
                renderObject(gltf.scene)
                guiInitializer(absMaterial, gltf.scene);
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
        const objLoader = new OBJLoader();
        objLoader.load(
            url,
            (obj) => {
                materialConfig(obj);
                renderObject(obj);
                guiInitializer(absMaterial, obj);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log(error);
            }
        )
        break;

    default:
        alert('No file found or extension not supported')
}

function setCamera(objectSize: Array<number>) {
    scene.background = new THREE.Color(0xfffff0)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    let x
    let y
    let z
    if (objectSize[0] != undefined && objectSize[1] != undefined && objectSize[1] != undefined) {
        x = objectSize[0]
        y = objectSize[1]
        z = objectSize[2]
    } else {
        var degree = Math.PI / 180;
        z = 120;
        y = 120;
        x = -45 * degree;
    }
    camera.position.set(y, x, z + x + y)

    const light = new THREE.PointLight()
    light.position.set(x, y, z + x + y)
    light.position.set(x, y, -(z + x + y))
    scene.add(light)

    // const ambientLight = new THREE.AmbientLight()
    // scene.add(ambientLight)
    var hemiLight = new THREE.HemisphereLight(0x443333, 0x111122, 0.61)
    hemiLight.position.set(0, 50, 0)
    scene.add(hemiLight)
    addShadowedLight(1, -1, 1, 0xffaa00, 1.35)
    addShadowedLight(1, 1, -1, 0xffaa00, 1)
    const light1 = new THREE.PointLight()
    const light2 = new THREE.PointLight()
    light1.position.set(0, 0, x + y + z)
    light2.position.set(0, 0, -x - y - z)
    scene.add(light1)
    scene.add(light2)
    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)
    // cameraTarget = new THREE.Vector3(0,0,0)

    scene.add(new THREE.AxesHelper(Math.max(x, y, z)))
}

function addShadowedLight(x: any, y: any, z: any, color: any, intensity: any) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = - 0.002;
}

function getBoxSize(object: any) {
    let boundingBox = new THREE.Box3().setFromObject(object);
    let boxSize = new THREE.Vector3();
    boundingBox.getSize(boxSize);
    return [Math.round(boxSize.x), Math.round(boxSize.y), Math.round(boxSize.z)]
}

function materialConfig(object: any) {
    object.traverse(function (child: any) {
        if (child.isMesh) {
            if (isCustomMaterial == true) {
                child.material = absMaterial;
            }
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

function renderObject(object: THREE.Object3D) {
    scene.add(object);
    object.position.set(0, 0, 0);
    object.castShadow = true;
    object.receiveShadow = true;
    boxSize = getBoxSize(object);
    setCamera(boxSize)
}
function guiInitializer(material: any, objectTD: THREE.Object3D) {
    const options = {
        wireframe: false,
        object: 0x1111111,
        background: 0xffffff0,
        lights: true,
        transparent: true
    }

    const gui = new GUI()
    const controlMaterial = gui.addFolder('Control Material')
    controlMaterial.add(material, 'transparent').onChange(() => material.needsUpdate = true)
    controlMaterial.add(material, 'opacity', 0, 1, 0.01)
    controlMaterial.add(material, 'wireframe').onChange(() => material.needsUpdated = true)
    controlMaterial.add(material, 'flatShading').onChange(() => material.needsUpdated = true)
    controlMaterial.add(objectTD, 'visible')
    controlMaterial.open()

    const ctrlCamera = gui.addFolder('Control Camera')
    ctrlCamera.add(objectTD.rotation, 'x', 0, Math.PI * 2)
    ctrlCamera.add(objectTD.rotation, 'y', 0, Math.PI * 2)
    ctrlCamera.add(objectTD.rotation, 'z', 0, Math.PI * 2)
    ctrlCamera.open()

    const colorFolder = gui.addFolder('Color Control')
    colorFolder.addColor(options, 'background').onChange(col => { scene.background = new THREE.Color(col) })
    colorFolder.addColor(options, 'object').onChange(col => { 
        absMaterial.color = new THREE.Color(col); 
        isCustomMaterial = true;
        materialConfig(objectTD);
    
    })
    colorFolder.open()
}

//recursive function to update scene continuously
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

animate();
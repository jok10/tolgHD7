import * as THREE from 'three';

let orbitAngle = 0.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
//near and far are clipping planes,
// wont render if closer than near, wont render if farther then far.
//camera.near(1.0) 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff)
document.body.appendChild(renderer.domElement);

const torus = new THREE.TorusGeometry(1.5)
const tormaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
const donut = new THREE.Mesh(torus,tormaterial);

const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry,material);

const floorgeo = new THREE.PlaneGeometry(14,14);
const floormat = new THREE.MeshBasicMaterial({color: 0xff0000,side: THREE.DoubleSide});
const floor = new THREE.Mesh(floorgeo,floormat);

scene.add(cube);
scene.add(donut);
scene.add(floor)
floor.rotateX(Math.PI/2)
floor.translateZ(5)
donut.translateX(4.5)

camera.position.z = 10;
camera.position.x = 5;
camera.position.y = 8;
camera.lookAt(0,0,0);

function animate(){
    orbitAngle += 0.035;
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    cube.position.x = 5*Math.cos(orbitAngle);
    cube.position.z = 2+5*Math.sin(orbitAngle);
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);
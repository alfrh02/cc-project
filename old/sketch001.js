import * as THREE from 'three';
import { OrbitControls } from 'controls';

var camera, scene, renderer, controls, raycaster, cursor, helper;
var geometry, material, mesh;
var helperGeometry, helperMaterial, helper;
var pointGeometry, pointMaterial, point;

var maptexture = './content/worldmap.jpg';

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.z = 3;

  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0xff0000 );
  
  //sphere texture & mesh
  const worldtexture = new THREE.TextureLoader().load( "./content/worldmap.jpg" );
  worldtexture.wrapS = THREE.RepeatWrapping;
  worldtexture.wrapT = THREE.RepeatWrapping;

  geometry = new THREE.SphereGeometry(1, 64, 64);
  material = new THREE.MeshBasicMaterial( { map: worldtexture } );
  //material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } );

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //helper point mesh
  const pointGeometry = new THREE.SphereGeometry(0.01, 4, 4)
  pointMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: false} )
  
  //helper mesh
  const helperGeometry = new THREE.SphereGeometry(0.02, 4, 4)
  helperMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false} )
  helper = new THREE.Mesh(helperGeometry, helperMaterial);
  scene.add(helper);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement); 

  controls.maxDistance = 10;  
  controls.minDistance = 2;

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.1;

  raycaster = new THREE.Raycaster();
  cursor = new THREE.Vector2();

  window.addEventListener('pointermove', function(event)
    {
      let rect = renderer.domElement.getBoundingClientRect();
      //calculate cursor position in normalised device coordinates (-1 to +1 for both components)
      cursor.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      cursor.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
     
      cursor.y = -cursor.y

      raycaster.setFromCamera(cursor, camera);

      const intersects = raycaster.intersectObject(mesh);
      
      if (intersects.length > 0) {
        helper.position.set(0,0,0);
        helper.position.copy(intersects[0].point);
      }
    
    });

  window.addEventListener('click', function()
    {
      const intersects = raycaster.intersectObject(mesh);
      if (cursor.x && intersects[0]) {
        point = new THREE.Mesh(pointGeometry, pointMaterial);
        scene.add(point);
        point.position.copy(intersects[0].point);
      }  
    })

  window.addEventListener('resize', function()
    {
      var width = window.innerWidth;
      var height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
}

function animate() {
  requestAnimationFrame(animate);

  //mesh.rotation.x += 0.01;
  //mesh.rotation.y += 0.0001;

  controls.update();

  helper.rotation.y += 0.01

  renderer.render(scene, camera);
}

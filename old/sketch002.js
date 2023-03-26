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
  scene.background = new THREE.Color( 0x1d2021 );
  
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
  //scene.add(helper);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement); 

  controls.maxDistance = 10;  
  //controls.minDistance = 2;

  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.1;

  raycaster = new THREE.Raycaster();
  cursor = new THREE.Vector2();

  let coordNameList = ["St. Petersburg", "London", "Berlin", "Beijing", "Tokyo", "Los Angeles", "Ottawa"]
  let coordList = [[59, 30], [51.5, 0], [52, 13], [39.9, 116.4], [35.6, 139.6], [34, 118.2], [45.4, 275.7]]; 

  var points = []

  let radius = 1;
  for (let i = 0; i < coordList.length; i++) {
    point = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(0.5,1),Math.random(0.5,1),Math.random(0.5,1)) } ));
    point.name = coordNameList[i];
    console.log(point.name);
    scene.add(point);

    //let x = r * Math.cos(0) * Math.sin(coordList[i][0]);
    //let y = r * Math.sin(0) * Math.sin(coordList[i][1]);
    //let z = r * Math.cos(coordList[i][2]);

    let lat = coordList[i][0];
    let lon = coordList[i][1];

    let phi = (90-lat) * (Math.PI/180);
    let theta = (lon+180) * (Math.PI/180);
    
    let x = -((radius) * Math.sin(phi) * Math.cos(theta));
    let y = ((radius) * Math.cos(phi));
    let z = ((radius) * Math.sin(phi) * Math.sin(theta));

    point.position.set(x, y, z);
    points.push(point);
    /*
    for (let j = 0; j < coordList[i].length; j++) {
      point = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(0.5,1),Math.random(0.5,1),Math.random(0.5,1)) } )); 
      scene.add(point);

      let x = r * Math.cos(0) * Math.sin(coordList[i][j]);
      let y = r * Math.sin(0) * Math.sin(coordList[i][j]);
      let z = r * Math.cos(coordList[i][j]);

      console.log(i + ": " + x + ", " + y + ", " + z)
      point.position.set(x,y,z);
    }
    */
  }
  
  window.addEventListener('pointermove', function(event)
    {
      let rect = renderer.domElement.getBoundingClientRect();
      //calculate cursor position in normalised device coordinates (-1 to +1 for both components)
      cursor.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      cursor.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
     
      cursor.y = -cursor.y

      raycaster.setFromCamera(cursor, camera);
    });

  window.addEventListener('click', function()
    {
      const intersects = raycaster.intersectObjects(points, true);
      if (cursor.x && intersects[0]) {
        console.log(intersects[0].object.name);
      }
      /*
      if (cursor.x && intersects[0]) {
        point = new THREE.Mesh(pointGeometry, pointMaterial);
        scene.add(point);
        point.position.copy(intersects[0].point);
        console.log(intersects[0].point)
      }
      */
    })

  window.addEventListener('resize', function()
    {
      var width = window.innerWidth;
      var height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  /*
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(0,0,1);
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(0,0,-1);
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(0,1,0);
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(0,-1,0);
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(1,0,0);
  point = new THREE.Mesh(pointGeometry, helperMaterial);
  scene.add(point);
  point.position.set(-1,0,0);
  */
}

function animate() {
  requestAnimationFrame(animate);

  //mesh.rotation.x += 0.01;
  //mesh.rotation.y += 0.0001;

  controls.update();

  //helper.rotation.y += 0.01

  renderer.render(scene, camera);
}

import * as THREE from 'three';
import { OrbitControls } from 'controls';
import { data } from "./points.js"

var camera, scene, renderer, controls, raycaster, cursor, helper;
var globeGeometry, globeMaterial, earth;
var helperGeometry, helperMaterial, helper;
var pointGeometry, pointMaterial, point;

var maptexture = './content/1_earth_16k.jpg';

init();
animate();

function test(t) {
  return t;
}


//
// converts latitude and longitude to xyz coordinates for placement on the globe. takes latitude, longitude, and radius.
//
function convertGlobeCoords(lat, lon, r) {
  let phi = (90-lat) * (Math.PI/180);
  let theta = (lon+180) * (Math.PI/180);

  let x = -(r * Math.sin(phi) * Math.cos(theta));
  let y = (r * Math.cos(phi));
  let z = (r * Math.sin(phi) * Math.sin(theta));

  return [x, y, z]; 
}

function init() {
  camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.z = 3;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x1d2021 );
  
  //sphere texture & mesh
  const worldtexture = new THREE.TextureLoader().load( maptexture );
  worldtexture.wrapS = THREE.RepeatWrapping;
  worldtexture.wrapT = THREE.RepeatWrapping;

  globeGeometry = new THREE.SphereGeometry(1, 64, 64);
  globeMaterial = new THREE.MeshStandardMaterial( { map: worldtexture } );
  //material = new THREE.MeshStandardMaterial( { color: 0xffffff, wireframe: true } );

  earth = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(earth);

  //helper point mesh
  const pointGeometry = new THREE.SphereGeometry(0.01, 4, 4)
  pointMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff, wireframe: false} )
  
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement); 

  controls.rotateSpeed = 0.5;
  controls.maxDistance = 10;  
  controls.minDistance = 2;

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.1;

  raycaster = new THREE.Raycaster();
  cursor = new THREE.Vector2();

  let pointLightCoords = convertGlobeCoords(50, 45, 1.25);
  /*
  let pointLight = new THREE.PointLight( new THREE.Color( 0x323232 ), 5)
  scene.add(pointLight);
  pointLight.position.set(pointLightCoords[0], pointLightCoords[1], pointLightCoords[2])
  */  
  
  let spotLight = new THREE.PointLight( new THREE.Color( 0x323232 ), 5);
  scene.add(spotLight);
  spotLight.position.set(pointLightCoords[0], pointLightCoords[1], pointLightCoords[2])
  spotLight.target = earth;

  let ambientLight = new THREE.AmbientLight( new THREE.Color( 0x323232 ), 1)
  scene.add(ambientLight);

  // initialise an array for each year, each contained in one big array, for example:
  //  years[0] would be 1917
  //  years[1] would be 1918 .. etc.
  // using historical event objects in the json to create 3d points and push them to their years' array
  //  years[0][0] would be the first historical event chronologicall
  
  var points = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      let matColour;
      matColour = new THREE.Color(Math.random(0.5,1),Math.random(0.5,1),Math.random(0.5,1));

      point = new THREE.Mesh(pointGeometry, new THREE.MeshStandardMaterial( { color: matColour })); 

      point.name = data[i][j].title;
      point.desc = data[i][j].desc;
      
      point.day = data[i][j].day;
      point.month = data[i][j].month;
      point.year = 1917 + i

      point.latitude = data[i][j].latitude;
      point.longitude = data[i][j].longitude;

      scene.add(point);

      let coords = convertGlobeCoords(point.latitude, point.longitude, 1)
      console.log(coords)

      point.x = coords[0];
      point.y = coords[1];
      point.z = coords[2];

      console.log(point)
      points.push(point);
    }
  }

  // patchwork solution to display points on webpage startup
  for (let i = 0; i < points.length; i++) {
    if (points[i].year == 1917) {
      points[i].position.set(points[i].x, points[i].y, points[i].z);
    } else {
      points[i].position.set(0, 0, 0);
    }
  }

	document.getElementById("movebutton").onclick = () => {
		camera.position.z += 1;
	}

	document.getElementById("rotatebutton").onclick = () => {
	  controls.autoRotate = !controls.autoRotate;	
	}

	document.getElementById("todobutton").onclick = () => {
    document.getElementById("title").innerHTML = "TODO:";
    document.getElementById("date").innerHTML = "";
    let br = "<br><br>"
    document.getElementById("desc").innerHTML = "- Update world map texture to add representative borders" + br +
                                                "- Add more clickable points of interest" + br +
                                                "- Add 'cinematic mode' which will cycle through points of interests chronologically (and will move the camera with it)" + br +
                                                "- Audiovisual implentation: add background ambience/music as well as images/videos to go with points of interests" + br + 
                                                "- Add a 'context window' which can give a more general summary of the time period selected.";
	}

  let slider = document.getElementById("slider")
  slider.oninput = () => {
    document.getElementById("year").innerHTML = slider.value;
    for (let i = 0; i < points.length; i++) {
      if (points[i].year == slider.value) {
        points[i].position.set(points[i].coords);
      } else {
        points[i].position.set(0, 0, 0);
      }
    }
    // every time the slider updates position the array of points according to the slider's value (e.g. 1917, 1918, etc.)
  }

  // shoot a ray following the cursor
  window.addEventListener('pointermove', (event) => {
    let rect = renderer.domElement.getBoundingClientRect();
    //calculate cursor position in normalised device coordinates (-1 to +1 for both components)
    cursor.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    cursor.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
 
    cursor.y = -cursor.y

    raycaster.setFromCamera(cursor, camera);
  });

  // check what the ray intersects 
  window.addEventListener('click', () => {
    const intersects = raycaster.intersectObjects(points, true);
    if (cursor.x && intersects[0]) {
      let obj = intersects[0].object
      document.getElementById("title").innerHTML = obj.name;
      document.getElementById("date").innerHTML = obj.day + " " + obj.month + " " + obj.year;
      document.getElementById("desc").innerHTML = obj.desc;
    }
  })

  // resize the renderer with the client's window
  window.addEventListener('resize', () => {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }); 
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

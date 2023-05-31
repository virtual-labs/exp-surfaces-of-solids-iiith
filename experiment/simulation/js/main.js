// import * as THREE from 'three';
import { OrbitControls } from './orbit.js'
import * as THREE from './three.js'
import {
  AddLight,
  addSphere,
  addSphereAtCoordinate,
  CheckHover,
  DeleteObject,
  RepeatPattern,
  TranslatePattern,
  updateButtonCSS,
  highlightSelectList,
  moveSelectList,
  checkSCP,
  select_Region,
  changeCurrentLatticePrev,
  changeCurrentLatticeNext,
  createLattice,
  latticeChecker,
} from './utils.js'

// init container
var container = document.getElementById('canvas-main')

// init the renderer and the scene
var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#000000')
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
container.appendChild(renderer.domElement)

// init perspective camera
var camera_distance = 25
var perspective_camera = new THREE.PerspectiveCamera(
  camera_distance, //FOV
  container.clientWidth / container.clientHeight, //aspect ratio
  0.1,
  1000,
)
var orthographic_camera = new THREE.OrthographicCamera(
  camera_distance / -2,
  camera_distance / 2,
  camera_distance / 2,
  camera_distance / -2,
  1,
  1000,
)
var camera = perspective_camera

// init the orbit controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
controls.autoRotate = true
controls.autoRotateSpeed = 0
controls.enablePan = false
controls.enableDamping = true
camera.position.set(25, 25, 25)

// initialize the axes
var axesHelper = new THREE.AxesHelper(container.clientHeight)
scene.add(axesHelper)

// add light to the  system
const lights = AddLight()
for (let i = 0; i < lights.length; i++) {
  scene.add(lights[i])
}

let Checked = document.getElementById('ToggleCamera')
Checked.addEventListener('click', function () {
  console.log('Clicked camera toggle')
  if (Checked.checked) {
    camera = orthographic_camera
    controls = new OrbitControls(camera, renderer.domElement)
  } else {
    camera = perspective_camera
    controls = new OrbitControls(camera, renderer.domElement)
  }
  controls.update()
  controls.autoRotate = true
  controls.autoRotateSpeed = 0
  controls.enablePan = false
  controls.enableDamping = true
  camera.position.set(50, 50, 50)
})

// to check the current object which keyboard points to
let INTERSECTED

function getMouseCoords(event) {
  var mouse = new THREE.Vector2()
  mouse.x =
    ((event.clientX - renderer.domElement.offsetLeft) /
      renderer.domElement.clientWidth) *
      2 -
    1
  mouse.y =
    -(
      (event.clientY - renderer.domElement.offsetTop) /
      renderer.domElement.clientHeight
    ) *
      2 +
    1
  // mouse.x = ( ( event.clientX - container.offsetLeft ) / container.clientWidth ) * 2 - 1;
  // mouse.y = - ( ( event.clientY - container.offsetTop ) / container.clientHeight ) * 2 + 1;
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse);
  return mouse
}
var mouse = new THREE.Vector2()
//  detect mouse click
let drag = false
document.addEventListener('mousedown', function (event) {
  drag = false
  mouse = getMouseCoords(event)
})
document.addEventListener('mousemove', function (event) {
  drag = true
  mouse = getMouseCoords(event)
})

let action = ''

// create a list of atoms in scene
var atomList = []

var SelectAtomList = []
var BoundaryAtomList = []

var CurrentHull
var CurrentHullMesh
var HullList = []
var curr_latticeID

const LatticeList = [
  'Square Planar',
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]

var currentLatticeElement = document.getElementById('LatticeList')
var currentLattice =
  currentLatticeElement.options[currentLatticeElement.selectedIndex].text
let currentAtomList = createLattice(LatticeList.indexOf(currentLattice))
var curr_latticeID = LatticeList.indexOf(currentLattice)
for (let i = 0; i < currentAtomList.length; i++) {
  scene.add(currentAtomList[i])
  atomList.push(currentAtomList[i])
}

currentLatticeElement.addEventListener('click', function () {
  currentLattice =
    currentLatticeElement.options[currentLatticeElement.selectedIndex].text
  // console.log('lattice change to', currentLattice)
  if(curr_latticeID != LatticeList.indexOf(currentLattice)) {
    for (let i = 0; i < currentAtomList.length; i++) {
    scene.remove(currentAtomList[i])
    }
    for (let i = 0; i < atomList.length; i++) {
      scene.remove(atomList[i])
    }
    for (let i = 0; i < HullList.length; i++) {
      scene.remove(HullList[i])
    }
    atomList = []
    currentAtomList = createLattice(LatticeList.indexOf(currentLattice))

    for (let i = 0; i < currentAtomList.length; i++) {
      scene.add(currentAtomList[i])
      atomList.push(currentAtomList[i])
    }
    SelectAtomList = []
    HullList = []
    curr_latticeID = LatticeList.indexOf(currentLattice)
    document.getElementById('lattice-result').innerHTML = ""
  }
})

// respond to check selected lattice
const CheckLattice = document.getElementById('CheckLattice')
CheckLattice.addEventListener('click', function () {
  //   console.log('Check Lattice Clicked')
  let out = latticeChecker(
    LatticeList.indexOf(currentLattice),
    SelectAtomList,
    atomList,
  )
  console.log('results', out)

  let lbl = document.getElementById('lattice-result')

  if (out[0]) lbl.innerHTML = "<span style='color: green;'>Correct choice of atoms!</span>"
  else
    lbl.innerHTML =
      "<span style='color: red;'>Incorrect choice of atoms!</span>"

  if (out[1])
    lbl.innerHTML =
      lbl.innerHTML +
      "<span style='color: green;'> The chosen unit cell is primitive</span>"
  else
    lbl.innerHTML =
      lbl.innerHTML +
      "<span style='color: red;'> The total atom volume enclosed should be 1</span>"
})

// select region enclosed between the atoms
const selectRegion = document.getElementById('SelectRegion')

selectRegion.addEventListener('click', function () {
  if (SelectAtomList.length < 4 || currentLattice == 'Square Planar') {
    let lbl = document.getElementById('lattice-result')
    lbl.innerHTML =
      "<span style='color: red;'>Select Region button expects atleast 4 non-planar points to be selected!</span>"

    return
  }
  for (let i = 0; i < HullList.length; i++) {
    scene.remove(HullList[i])
  }

  let vals = select_Region(SelectAtomList, atomList)
  let hullmesh = vals.mesh
  CurrentHullMesh = vals.mesh
  let arr = vals.selectarray
  CurrentHull = vals.convexHull
  for (let i = 0; i < arr.length; i++) {
    if (!SelectAtomList.includes(arr[i])) {
      SelectAtomList.push(arr[i])
    }
  }
  HullList.push(hullmesh)
  scene.add(hullmesh)
})

let toggleselectbutton = document.getElementById('ToggleSelect')
toggleselectbutton.addEventListener('click', function () {
  if (action != 'selectAtom') {
    action = 'selectAtom'
  } else {
    action = ''
    // SelectAtomList = []
  }
})
const ClearStuff = document.getElementById('ClearSelection')
ClearStuff.addEventListener('click', function () {
  SelectAtomList = []
  for (let i = 0; i < HullList.length; i++) {
    scene.remove(HullList[i])
  }
  HullList = []
  //add vector removal here
})

const Slider = document.getElementById('radiiSlider')
const sliderval = document.getElementById('radiisliderval')
sliderval.innerHTML = Slider.valueAsNumber
var currentradii = Slider.valueAsNumber

Slider.oninput = function () {
  currentradii = Slider.valueAsNumber
  sliderval.innerHTML = Slider.valueAsNumber
  var newatomlist = []

  for (let i = 0; i < atomList.length; i++) {
    var pos = atomList[i].position
    let atom = addSphereAtCoordinate(pos, 'Y')
    scene.remove(atomList[i])
    scene.add(atom)
    newatomlist.push(atom)
  }
  atomList = newatomlist
  var newSelectAtomList = []
  for (let i = 0; i < SelectAtomList.length; i++) {
    var pos1 = SelectAtomList[i].position
    for (let j = 0; j < atomList.length; j++) {
      var pos2 = atomList[j].position
      if (JSON.stringify(pos1) === JSON.stringify(pos2)) {
        newSelectAtomList.push(atomList[j])
      }
    }
  }
  SelectAtomList = newSelectAtomList
}

// make the window responsive
window.addEventListener('resize', () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
})

document.addEventListener('mouseup', function (event) {
  var pressType = event.button // 2 for right click, 0 for left clickl
  if (drag == false) {
    // if the action is add atom
    if (action == 'selectAtom') {
      INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
      if (INTERSECTED) {
        if (SelectAtomList.includes(INTERSECTED) && pressType == 2) {
          var indexofatom = SelectAtomList.indexOf(INTERSECTED)
          SelectAtomList.splice(indexofatom, 1)
        } else if (!SelectAtomList.includes(INTERSECTED)) {
          SelectAtomList.push(INTERSECTED)
        }
      }
    }
  }
})

//delete atom
document.addEventListener('keydown', function (event) {
  var keyCode = event.key
  if (keyCode == 'd') {
    // DeleteObject(mouse, camera, scene, atomList, SelectAtomList, INTERSECTED)
    INTERSECTED = CheckHover(mouse, camera, atomList)
    if (INTERSECTED) {
      var index = atomList.indexOf(INTERSECTED)
      if (index > -1) {
        atomList.splice(index, 1)
      }
      var index = SelectAtomList.indexOf(INTERSECTED)
      if (index > -1) {
        SelectAtomList.splice(index, 1)
      }
      scene.remove(INTERSECTED)
    }
  }
})

// render the scene and animate
var render = function () {
  highlightSelectList(SelectAtomList, atomList)
  // updateButtonCSS(action);
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()

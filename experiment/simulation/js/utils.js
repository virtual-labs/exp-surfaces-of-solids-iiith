import * as THREE from './three.js'
import { ConvexGeometry } from './convex.js'
import { ConvexHull } from './hull.js'

var trueTypeOf = (obj) =>
  Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()

var radius_scale = 1 / 100
var atomDetails = {
  X: {
    radius: 60,
    color: '#5D3FD3',
  },
  Y: {
    radius: 100,
    color: '#5D3FD3',
  },
  Z: {
    radius: 100,
    color: '#5D3FD3',
  },
  Zn: {
    radius: 135,
    color: '#a9a9a9',
  },
  Cl: {
    radius: 100,
    color: '#cfe942',
  },
  Cs: {
    radius: 260,
    color: '#ffd700',
  },
  S: {
    radius: 100,
    color: '#ffff00',
  },
  Na: {
    radius: 180,
    color: '#fcfcfc',
  },
  C: {
    radius: 70,
    color: '#8fce00',
  },
}

export function addSphere(mouse, atomname, camera, scene) {
  var intersectionPoint = new THREE.Vector3()
  var planeNormal = new THREE.Vector3()
  var plane = new THREE.Plane()
  var raycaster = new THREE.Raycaster()
  planeNormal.copy(camera.position).normalize()
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
  raycaster.setFromCamera(mouse, camera)
  raycaster.ray.intersectPlane(plane, intersectionPoint)
  // console.log(atomDetails[atomname]);
  const radii = document.getElementById('radiiSlider')
  console.log('radiii is', radii.valueAsNumber)
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radii.valueAsNumber, 20, 20),
    new THREE.MeshStandardMaterial({
      color: atomDetails[atomname].color,
      name: 'sphere',
      roughness: 5,
    }),
  )
  sphereMesh.position.copy(intersectionPoint)
  // sphereMesh.material.emissive.setHex(0xff44ff);
  return sphereMesh
}

export function addSphereAtCoordinate(AddVec, atomname, atomtype = 'default') {
  var atomcolor = atomDetails[atomname].color
  var atomopacity = 1.0
  if (atomtype == 'dummy') {
    atomcolor = 0x746c70
    atomopacity = 0.3
  }
  const radii = document.getElementById('radiiSlider')
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radii.valueAsNumber, 20, 20),
    new THREE.MeshStandardMaterial({
      color: atomcolor,
      name: 'sphere',
      roughness: 5,
      transparent: true,
      opacity: atomopacity,
    }),
  )
  sphereMesh.position.copy(AddVec)
  return sphereMesh
}

export function CheckHover(mouse, camera, atomList, INTERSECTED) {
  var raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(atomList, false)
  var pink = 0xffffff
  var blue = 0x00ffff
  var black = 0x000000
  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(black)
      }

      INTERSECTED = intersects[0].object
      INTERSECTED.currentHex = blue
      INTERSECTED.material.emissive.setHex(pink)
    }
    INTERSECTED.material.emissive.setHex(pink)
  } else {
    if (INTERSECTED) INTERSECTED.material.emissive.setHex(black)
    INTERSECTED = null
  }
  return INTERSECTED
}

export function DeleteObject(mouse, camera, scene, atomList, INTERSECTED) {
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  scene.remove(INTERSECTED)
  // atomList.remove(INTERSECTED);
  const index = atomList.indexOf(INTERSECTED)
  if (index > -1) {
    atomList.splice(index, 1)
  }
}

export function AddLight() {
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(100, 100, 50)
  light.castShadow = true
  const light2 = new THREE.DirectionalLight(0xffffff, 1)
  light2.position.set(-100, 100, -50)
  light2.castShadow = true
  const light3 = new THREE.DirectionalLight(0xffffff, 1)
  light3.position.set(0, 100, 0)
  light3.castShadow = true

  return [light, light2, light3]
}

export function RepeatPattern(SelectAtomList, repeatVec) {
  var newAtoms = []
  for (let i = 0; i < SelectAtomList.length; i++) {
    var curAtom = SelectAtomList[i]
    var newpos = curAtom.position.clone()
    // var translateVec = new THREE.Vector3(1, 1, 1);
    // console.log("SIII");
    // console.log(curAtom);
    newpos.add(repeatVec)
    var sphereMesh = curAtom.clone()
    console.log(sphereMesh)

    sphereMesh.position.copy(newpos)
    newAtoms.push(sphereMesh)
  }
  return newAtoms
}

export function TranslatePattern(SelectAtomList, translateVec, count) {
  var allNewAtoms = []
  while (--count) {
    var newAtoms = []
    for (let i = 0; i < SelectAtomList.length; i++) {
      var curAtom = SelectAtomList[i]
      var newpos = curAtom.position.clone()
      // var translateVec = new THREE.Vector3(1, 1, 1);
      translateVec.multiplyScalar(count)
      newpos.add(translateVec)

      var sphereMesh = curAtom.clone()

      sphereMesh.position.copy(newpos)
      newAtoms.push(sphereMesh)
      translateVec.multiplyScalar(1 / count)
    }
    for (let i = 0; i < newAtoms.length; i++) {
      allNewAtoms.push(newAtoms[i])
    }
  }
  return allNewAtoms
}

export function updateButtonCSS(action) {
  // if (action == "addAtom") {
  //     document.getElementById("AddAtom").style =
  //         "background-color:  #f14668; color: #000000 ";
  //     document.getElementById("SelectAtom").style =
  //         "color:  #f14668; background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  // } else if (action == "selectAtom") {
  //     document.getElementById("SelectAtom").style =
  //         "background-color:  #f14668; ; color: #000000 ";
  //     document.getElementById("AddAtom").style =
  //         "color:  #f14668; ;background: transparent; outline: 1px solid  #f14668; ;border: 0px;padding: 5px 10px;cursor: pointer;";
  // } else {
  //     document.getElementById("AddAtom").style =
  //         "color:  #f14668;background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  //     document.getElementById("SelectAtom").style =
  //         "color:  #f14668; background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  // }
}
function containsObject(obj, list) {
  var i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }
  return false
}
export function highlightSelectList(SelectAtomList, atomList) {
  for (let j = 0; j < atomList.length; j++) {
    var atom = atomList[j]
    var pink = 0xffffff
    var blue = 0x00ffff
    var black = 0x000000
    if (containsObject(atom, SelectAtomList)) {
      var a = atom.material.emissive.getHex()
      // atom.currentHex = blue;
      atom.material.emissive.setHex(pink)
    } else {
      // var a = atom.material.emissive.getHex();
      // atom.currentHex = blue;
      atom.material.emissive.setHex(black)
    }
  }
}

export function moveSelectList(SelectAtomList, moveVector) {
  for (let i = 0; i < SelectAtomList.length; i++) {
    var currpos = SelectAtomList[i].position.clone()
    //if(i==0) console.log(currpos.y);
    currpos.add(moveVector)
    //if(i==0) console.log(currpos.y);
    SelectAtomList[i].position.copy(currpos)
  }
}

export function checkSCP(SelectAtomList) {
  if (SelectAtomList.length != 8) return false
  for (let i = 0; i < SelectAtomList.length - 1; i++) {
    for (let j = i + 1; j < SelectAtomList.length; j++) {
      var dist = SelectAtomList[i].position.distanceToSquared(
        SelectAtomList[j].position,
      )
      if (dist == 4 || dist == 8 || dist == 12) continue
      else return false
    }
  }
  return true
}
export function constructHull(SelectAtomList) {
  let posarray = []
  var pos = new THREE.Vector3()
  for (let i = 0; i < SelectAtomList.length; i++) {
    pos = SelectAtomList[i].position.clone()
    posarray.push(pos)
  }
  var convexHull = new ConvexHull().setFromPoints(posarray)
  for (let i = 0; i < convexHull.faces.length; i++) {
    var normal = convexHull.faces[i].normal
    console.log('norm', normal)
  }
  return convexHull
}

export function select_Region(SelectAtomList, atomList) {
  let posarray = []
  var pos = new THREE.Vector3()
  for (let i = 0; i < SelectAtomList.length; i++) {
    pos = SelectAtomList[i].position.clone()
    posarray.push(pos)
  }
  let selectarray = []
  var convexHull = new ConvexHull().setFromPoints(posarray)
  for (let i = 0; i < atomList.length; i++) {
    pos = atomList[i].position.clone()
    if (convexHull.containsPoint(pos)) {
      selectarray.push(atomList[i])
    }
  }
  const geometry = new ConvexGeometry(posarray)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff44ff,
    roughness: 5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return { mesh, selectarray }
}
const LatticeList = [
  'Square Planar',
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]
let LatticeIndex = 0

export function changeCurrentLatticeNext() {
  //   console.log('clicked')
  let lbl = document.getElementById('current-lattice')

  LatticeIndex += 1
  if (LatticeIndex == LatticeList.length) {
    LatticeIndex = 0
  }
  lbl.innerText = LatticeList[LatticeIndex] // TREATS EVERY CONTENT AS TEXT.
  return LatticeIndex
}
export function changeCurrentLatticePrev() {
  //   console.log('clicked')
  let lbl = document.getElementById('current-lattice')

  LatticeIndex -= 1
  if (LatticeIndex == -1) {
    LatticeIndex = LatticeList.length - 1
  }
  lbl.innerText = LatticeList[LatticeIndex] // TREATS EVERY CONTENT AS TEXT.
  return LatticeIndex
}

export function createLattice(latticeID) {
  let atomlist = []
  if (latticeID == 0) {
    console.log('square')
    let latticedims = [5, 5, 5]
    for (let x = -5; x < latticedims[0]; x += 2) {
      for (let y = -5; y < latticedims[1]; y += 2) {
        let pos = new THREE.Vector3(x, 0, y)
        let atom = addSphereAtCoordinate(pos, 'Y')
        atomlist.push(atom)
      }
    }
  } else if (latticeID == 1) {
    console.log('simple cubic')
    let latticedims = [6, 6, 6]
    for (let x = -6; x < latticedims[0]; x += 2) {
      for (let y = -6; y < latticedims[1]; y += 2) {
        for (let z = -6; z < latticedims[2]; z += 2) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 2) {
    console.log('adding face centered cubic')
    let latticedims = [10, 10, 10]
    for (let x = 0; x < latticedims[0]; x += 3) {
      for (let y = 0; y < latticedims[1]; y += 3) {
        for (let z = 0; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 1.5; x < latticedims[0]; x += 3) {
      for (let y = 1.5; y < latticedims[1]; y += 3) {
        for (let z = 0; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 1.5; x < latticedims[0]; x += 3) {
      for (let y = 0; y < latticedims[1]; y += 3) {
        for (let z = 1.5; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 0; x < latticedims[0]; x += 3) {
      for (let y = 1.5; y < latticedims[1]; y += 3) {
        for (let z = 1.5; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 3) {
    console.log('adding body centered cubic')
    let latticedims = [20, 20, 20]
    for (let x = 0; x < latticedims[0]; x += 4) {
      for (let y = 0; y < latticedims[1]; y += 4) {
        for (let z = 0; z < latticedims[2]; z += 4) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'Y')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 2; x < latticedims[0]; x += 4) {
      for (let y = 2; y < latticedims[1]; y += 4) {
        for (let z = 2; z < latticedims[2]; z += 4) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'Y')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 4) {
    console.log('adding HCP')
    let latticedims = [20, 20, 20]
    let height = 0
    for (let z = 0; z < latticedims[2]; z += 1.732) {
      if (height % 2 == 0) {
        for (let x = 0; x < latticedims[0]; x += 2) {
          let row = 0
          for (let y = 0; y < latticedims[1]; y += 1.732) {
            let pos
            if (row % 2 == 0) {
              pos = new THREE.Vector3(x, y, z)
            } else {
              pos = new THREE.Vector3(x + 1, y, z)
            }
            row += 1
            let atom = addSphereAtCoordinate(pos, 'X')
            atomlist.push(atom)
          }
        }
      } else {
        for (let x = 1; x < latticedims[0]; x += 2) {
          let row = 0
          for (let y = 0.577; y < latticedims[1]; y += 1.732) {
            let pos
            if (row % 2 == 0) {
              pos = new THREE.Vector3(x, y, z)
            } else {
              pos = new THREE.Vector3(x + 1, y, z)
            }
            row += 1
            let atom = addSphereAtCoordinate(pos, 'X')
            atomlist.push(atom)
          }
        }
      }
      height += 1
    }
  }
  return atomlist
}
export function distancesum(l) {
  let sum = 0
  for (let i = 0; i < l.length; i++) {
    for (let j = 0; j < l.length; j++) {
      let pos1 = l[i].position
      let pos2 = l[j].position
      let d = pos1.distanceTo(pos2)
      sum += d
    }
  }
  console.log(sum, l)
  return sum
}
export function pairwiseDistances(array) {
  var all_dists = {}
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      var dist = Math.round(array[i].point.distanceTo(array[j].point) * 1000)
      if (Object.keys(all_dists).includes(dist.toString())) {
        all_dists[dist] = all_dists[dist] + 1
      } else {
        all_dists[dist] = 1
      }
    }
  }
  console.log('all_dists', all_dists)
  return Object.values(all_dists)
}

export function HullCount(hull, atomList) {
  var count = 0
  for (let i = 0; i < atomList.length; i++) {
    if (hull.containsPoint(atomList[i].position)) {
      count = count + 1
    }
  }
  console.log('count', count)
  return count
}

export function planeprimitive(SelectAtomList, atomList) {
  var min = 1000
  for (let i = 0; i < atomList.length; i++) {
    var dist = atomList[0].position.distanceTo(atomList[i].position)
    if (min > dist) {
      min = dist
    }
  }
  for (let i = 0; i < SelectAtomList.length; i++) {
    for (let j = i; j < SelectAtomList.length; j++) {
      var dist = SelectAtomList[i].position.distanceTo(
        SelectAtomList[j].position,
      )
      if (dist == min && SelectAtomList.length == 4) {
        return 1
      }
    }
  }
  return 0
}
export function latticeChecker(latticeID, SelectAtomList, atomList) {
  if (latticeID == 0) {
    var hull = constructHull(SelectAtomList)
    var numatoms = HullCount(hull, atomList)
    var isPrimitive = planeprimitive(SelectAtomList, atomList)

    var counts = pairwiseDistances(hull.vertices)
    console.log('counts', counts)
    var square_counts = [4, 2]
    var parallelogram_counts = [1, 2, 3]
    var numatoms = HullCount(hull, atomList)

    if (
      JSON.stringify(counts.sort()) === JSON.stringify(square_counts.sort())
    ) {
      return [1, isPrimitive]
    } else if (
      JSON.stringify(counts.sort()) ===
      JSON.stringify(parallelogram_counts.sort())
    ) {
      return [1, isPrimitive]
    }
    return [0, isPrimitive]
  }
  if (latticeID == 1) {
    var overall_norm = { x: 0, y: 0, z: 0 }
    var hull = constructHull(SelectAtomList)
    var numatoms = HullCount(hull, atomList)
    var isPrimitive = 0
    if (numatoms == 8) {
      isPrimitive = 1
    }
    var counts = pairwiseDistances(hull.vertices)
    for (let i = 0; i < hull.faces.length; i++) {
      var norm = hull.faces[i].normal
      overall_norm.x = overall_norm.x + norm.x
      overall_norm.y = overall_norm.y + norm.y
      overall_norm.z = overall_norm.z + norm.z
    }
    console.log('overall_norm', overall_norm)
    if (overall_norm.x == 0 && overall_norm.y == 0 && overall_norm.z == 0) {
      return [1, isPrimitive]
    }
    return [0, isPrimitive]
  }
  if (latticeID == 2) {
    var overall_norm = { x: 0, y: 0, z: 0 }
    var hull = constructHull(SelectAtomList)
    var numatoms = HullCount(hull, atomList)
    var isPrimitive = 0
    if (numatoms == 8) {
      isPrimitive = 1
    }
    var counts = pairwiseDistances(hull.vertices)
    for (let i = 0; i < hull.faces.length; i++) {
      var norm = hull.faces[i].normal
      overall_norm.x = overall_norm.x + norm.x
      overall_norm.y = overall_norm.y + norm.y
      overall_norm.z = overall_norm.z + norm.z
    }
    console.log('overall_norm', overall_norm)
    if (overall_norm.x == 0 && overall_norm.y == 0 && overall_norm.z == 0) {
      return [1, isPrimitive]
    }
    return [0, isPrimitive]
  }
  if (latticeID == 3) {
    var overall_norm = { x: 0, y: 0, z: 0 }
    var hull = constructHull(SelectAtomList)
    var numatoms = HullCount(hull, atomList)
    var isPrimitive = 0
    if (numatoms == 8) {
      isPrimitive = 1
    }
    var counts = pairwiseDistances(hull.vertices)
    for (let i = 0; i < hull.faces.length; i++) {
      var norm = hull.faces[i].normal
      overall_norm.x = overall_norm.x + norm.x
      overall_norm.y = overall_norm.y + norm.y
      overall_norm.z = overall_norm.z + norm.z
    }
    console.log('overall_norm', overall_norm)
    if (overall_norm.x == 0 && overall_norm.y == 0 && overall_norm.z == 0) {
      return [1, isPrimitive]
    }
    return [0, isPrimitive]
  }
  if (latticeID == 4) {
    var overall_norm = { x: 0, y: 0, z: 0 }
    var hull = constructHull(SelectAtomList)
    var numatoms = HullCount(hull, atomList)
    var isPrimitive = 0
    if (numatoms == 12) {
      isPrimitive = 1
    }
    var counts = pairwiseDistances(hull.vertices)
    for (let i = 0; i < hull.faces.length; i++) {
      var norm = hull.faces[i].normal
      overall_norm.x = overall_norm.x + norm.x
      overall_norm.y = overall_norm.y + norm.y
      overall_norm.z = overall_norm.z + norm.z
    }
    console.log('overall_norm', overall_norm)
    if (overall_norm.x == 0 && overall_norm.y == 0 && overall_norm.z == 0) {
      return [1, isPrimitive]
    }
    return [0, isPrimitive]
  }
}

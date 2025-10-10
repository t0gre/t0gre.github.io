import { Material, 
    MeshBasicMaterial, 
    MeshStandardMaterial, 
    MeshPhysicalMaterial,
    Object3D, 
    Mesh,
    SkinnedMesh, 
    InstancedMesh,
    BoxGeometry,
    IcosahedronGeometry,
    SphereGeometry} from "three"

export type GeometryUnion = BoxGeometry | SphereGeometry | IcosahedronGeometry

export function isBoxGeometry(geometry: GeometryUnion): geometry is BoxGeometry {
    return geometry.type === "BoxGeometry"
}

export function isSphereGeometry(geometry: GeometryUnion): geometry is SphereGeometry {
    return geometry.type === "SphereGeometry"
}

export function isIcosahedronGeometry(geometry: GeometryUnion): geometry is IcosahedronGeometry {
    return geometry.type === "IcosahedronGeometry"
}

export function isMesh(object3d: Object3D): object3d is Mesh {
    return (object3d as Mesh).isMesh === true
}

export function isInstancedMesh(object3d: Object3D): object3d is InstancedMesh {
    return (object3d as InstancedMesh).isInstancedMesh === true
}

export function isSkinnedMesh(object3d: Object3D): object3d is SkinnedMesh {
    return (object3d as SkinnedMesh).isSkinnedMesh === true
}

export function isMeshBasicMaterial(material: Material): material is MeshBasicMaterial {
    return (material as MeshBasicMaterial).isMeshBasicMaterial === true
}

export function isMeshStandardMaterial(material: Material): material is MeshStandardMaterial {
    return (material as MeshStandardMaterial).isMeshStandardMaterial === true
}

export function isMeshPhysicalMaterial(material: Material): material is MeshPhysicalMaterial {
    return (material as MeshPhysicalMaterial).isMeshPhysicalMaterial === true
}


export function disposeAllTextures(material: Material) {
  if (isMeshBasicMaterial(material)) {
    material.map?.dispose()
    material.specularMap?.dispose()
    material.alphaMap?.dispose()

  } else if (isMeshStandardMaterial(material)) {
    material.map?.dispose()
    material.bumpMap?.dispose()
    material.displacementMap?.dispose()
    material.emissiveMap?.dispose()
    material.metalnessMap?.dispose()
    material.normalMap?.dispose()
    material.roughnessMap?.dispose()
  } else if (isMeshPhysicalMaterial(material)) {
    material.map?.dispose()
    material.bumpMap?.dispose()
    material.displacementMap?.dispose()
    material.emissiveMap?.dispose()
    material.metalnessMap?.dispose()
    material.normalMap?.dispose()
    material.roughnessMap?.dispose()

    material.anisotropyMap?.dispose()
    material.clearcoatMap?.dispose()
    material.clearcoatRoughnessMap?.dispose()
    material.iridescenceMap?.dispose()
    material.iridescenceThicknessMap?.dispose()
    material.sheenRoughnessMap?.dispose()
    material.specularIntensityMap?.dispose()
    material.specularColorMap?.dispose()
    material.thicknessMap?.dispose()
    material.transmissionMap?.dispose()
  }
  

}

export function disposeMaterial(material: Material | Material[]) {
    if (Array.isArray(material)) {
        material.forEach(singleMaterial => {
            singleMaterial.dispose()
            disposeAllTextures(singleMaterial)
        })
    } else {
        material.dispose()
        disposeAllTextures(material)
    }
}
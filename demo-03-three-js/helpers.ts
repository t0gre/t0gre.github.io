import { Object3D, SkinnedMesh } from "three"

export function isSkinnedMesh(object3d: Object3D): object3d is SkinnedMesh {
    return (object3d as SkinnedMesh).isSkinnedMesh === true
}
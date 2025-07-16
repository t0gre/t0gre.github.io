import { expect, test } from 'vitest'
import { setParent, SceneNode } from "demo-01-ts-webgl/lib/Scene";

test('setParent updates parent and children correctly', () => {

const childNode: SceneNode = {
    pose: { position: [1, 1, 1], rotation: [0, 0, 0] },
    children: []
}

const parentNode1: SceneNode = {
    pose: { position: [0, 0, 0], rotation: [0, 0, 0] },
    children: []
}

const parentNode2: SceneNode = {
    pose: { position: [0, 0, 0], rotation: [0, 0, 0] },
    children: []
}

setParent(childNode, parentNode1);


expect(childNode.parent === parentNode1, "child's parent is correct").toBe(true), 
expect(parentNode1.children.includes(childNode), "parent's children to be correct").toBe(true) 

setParent(childNode, parentNode2);

expect(childNode.parent === parentNode2, "child's new parent is correct").toBe(true), 
expect(parentNode2.children.includes(childNode), "new parent's chuldren to be correct").toBe(true) 
expect(!parentNode1.children.includes(childNode), "old parents children to not include the child").toBe(true) 


})
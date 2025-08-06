import { expect, test } from 'vitest'
import { setParent, SceneNode } from "demo-01-ts-webgl/lib/scene";
import { m4fromPositionAndEuler } from 'demo-01-ts-webgl/lib/mat4';

test('setParent updates parent and children correctly', () => {

const childNode: SceneNode = {
    localTransform: m4fromPositionAndEuler([1, 1, 1], [0, 0, 0]),
    children: []
}

const parentNode1: SceneNode = {
    localTransform: m4fromPositionAndEuler([0, 0, 0], [0, 0, 0]),
    children: []
}

const parentNode2: SceneNode = {
    localTransform: m4fromPositionAndEuler([0, 0, 0], [0, 0, 0]),
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